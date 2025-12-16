import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';
import { createNileConfig } from '@/lib/niledb/config';
import {
    generateAnalyticsCacheKey,
    getAnalyticsCache,
    setAnalyticsCache,
    CACHE_TTL
} from '@/lib/cache/analytics-cache';
import { DomainAnalytics } from '@/types/analytics/domain-specific';

/**
 * GET /api/analytics/domains
 * 
 * Fetches domain analytics from the OLAP database.
 * Supports filtering by domainIds and companyId.
 * Implements Redis caching with 5-minute TTL.
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const domainIdsParam = searchParams.get('domainIds');
        const companyId = searchParams.get('companyId') || 'default';

        // Parse domain IDs
        const domainIds = domainIdsParam
            ? domainIdsParam.split(',').map((id: string) => id.trim()).filter(Boolean)
            : [];

        // Generate cache key
        const cacheKey = await generateAnalyticsCacheKey(
            'domains',
            'getDomainAnalytics',
            domainIds,
            { companyId },
            CACHE_TTL.RECENT
        );

        // Try to get from cache
        const cachedData = await getAnalyticsCache<DomainAnalytics[]>(cacheKey);
        if (cachedData) {
            return NextResponse.json({
                success: true,
                data: cachedData,
                cached: true,
                timestamp: new Date().toISOString(),
            });
        }

        // Query OLAP database
        const nileConfig = createNileConfig();
        const client = new Client({
            connectionString: nileConfig.databases.olap.url
        });

        await client.connect();

        try {
            // Build query with optional domain ID filtering
            const query = `
        SELECT 
          domain_id as "domainId",
          domain_name as "domainName",
          sent,
          delivered,
          opened_tracked as "opened_tracked",
          clicked_tracked as "clicked_tracked",
          replied,
          bounced,
          unsubscribed,
          spam_complaints as "spamComplaints",
          authentication_spf as "authenticationSpf",
          authentication_dkim as "authenticationDkim",
          authentication_dmarc as "authenticationDmarc",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM domain_analytics
        WHERE company_id = $1
          AND ($2::text[] IS NULL OR domain_id = ANY($2))
        ORDER BY updated_at DESC
      `;

            const values = [
                companyId,
                domainIds.length > 0 ? domainIds : null
            ];

            const result = await client.query(query, values);

            // Transform to match DomainAnalytics interface
            const domains: DomainAnalytics[] = result.rows.map((row: any) => ({
                id: row.domainId,
                name: row.domainName,
                domainId: row.domainId,
                domainName: row.domainName,
                sent: row.sent || 0,
                delivered: row.delivered || 0,
                opened_tracked: row.opened_tracked || 0,
                clicked_tracked: row.clicked_tracked || 0,
                replied: row.replied || 0,
                bounced: row.bounced || 0,
                unsubscribed: row.unsubscribed || 0,
                spamComplaints: row.spamComplaints || 0,
                authentication: {
                    spf: row.authenticationSpf || false,
                    dkim: row.authenticationDkim || false,
                    dmarc: row.authenticationDmarc || false,
                },
                aggregatedMetrics: {
                    sent: row.sent || 0,
                    delivered: row.delivered || 0,
                    opened_tracked: row.opened_tracked || 0,
                    clicked_tracked: row.clicked_tracked || 0,
                    replied: row.replied || 0,
                    bounced: row.bounced || 0,
                    unsubscribed: row.unsubscribed || 0,
                    spamComplaints: row.spamComplaints || 0,
                },
                updatedAt: new Date(row.updatedAt).getTime(),
            }));

            // Cache the results
            await setAnalyticsCache(cacheKey, domains, CACHE_TTL.RECENT);

            return NextResponse.json({
                success: true,
                data: domains,
                cached: false,
                timestamp: new Date().toISOString(),
            });

        } finally {
            await client.end();
        }

    } catch (error) {
        console.error('Domain analytics API error:', error);

        // Check if it's a table not found error (graceful degradation)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (errorMessage.includes('does not exist') || errorMessage.includes('relation')) {
            return NextResponse.json({
                success: true,
                data: [],
                cached: false,
                timestamp: new Date().toISOString(),
                warning: 'Analytics table not found - returning empty data',
            });
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch domain analytics',
                message: errorMessage,
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}
