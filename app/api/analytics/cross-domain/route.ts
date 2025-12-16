import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';
import { createNileConfig } from '@/lib/niledb/config';
import {
    generateAnalyticsCacheKey,
    getAnalyticsCache,
    setAnalyticsCache,
    CACHE_TTL
} from '@/lib/cache/analytics-cache';

/**
 * GET /api/analytics/cross-domain
 * 
 * Fetches cross-domain analytics (mailbox-domain joined data) from OLAP database.
 * Supports filtering by domainIds, mailboxIds, dateRange, and companyId.
 * Implements Redis caching with 2-minute TTL for more frequent updates.
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const domainIdsParam = searchParams.get('domainIds');
        const mailboxIdsParam = searchParams.get('mailboxIds');
        const companyId = searchParams.get('companyId') || 'default';
        const dateRangeStart = searchParams.get('dateRangeStart');
        const dateRangeEnd = searchParams.get('dateRangeEnd');

        // Parse IDs
        const domainIds = domainIdsParam
            ? domainIdsParam.split(',').map((id: string) => id.trim()).filter(Boolean)
            : [];
        const mailboxIds = mailboxIdsParam
            ? mailboxIdsParam.split(',').map((id: string) => id.trim()).filter(Boolean)
            : [];

        // Generate cache key
        const cacheKey = await generateAnalyticsCacheKey(
            'cross-domain',
            'getCrossDomainAnalytics',
            [...domainIds, ...mailboxIds],
            { companyId, dateRange: { start: dateRangeStart || '', end: dateRangeEnd || '' } },
            CACHE_TTL.REAL_TIME * 2 // 2 minutes
        );

        // Try to get from cache
        const cachedData = await getAnalyticsCache(cacheKey);
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
            // Build query for cross-domain analytics
            const query = `
        SELECT 
          cd.id,
          cd.domain_id as "domainId",
          cd.mailbox_id as "mailboxId",
          cd.company_id as "companyId",
          cd.sent,
          cd.delivered,
          cd.opened_tracked as "openedTracked",
          cd.clicked_tracked as "clickedTracked",
          cd.replied,
          cd.bounced,
          cd.created_at as "createdAt",
          cd.updated_at as "updatedAt"
        FROM cross_domain_analytics cd
        WHERE cd.company_id = $1
          AND ($2::text[] IS NULL OR cd.domain_id = ANY($2))
          AND ($3::text[] IS NULL OR cd.mailbox_id = ANY($3))
          AND ($4::timestamp IS NULL OR cd.created_at >= $4)
          AND ($5::timestamp IS NULL OR cd.created_at <= $5)
        ORDER BY cd.updated_at DESC
        LIMIT 1000
      `;

            const values = [
                companyId,
                domainIds.length > 0 ? domainIds : null,
                mailboxIds.length > 0 ? mailboxIds : null,
                dateRangeStart || null,
                dateRangeEnd || null,
            ];

            const result = await client.query(query, values);

            const data = result.rows.map((row: any) => ({
                id: row.id,
                domainId: row.domainId,
                mailboxId: row.mailboxId,
                companyId: row.companyId,
                sent: row.sent || 0,
                delivered: row.delivered || 0,
                openedTracked: row.openedTracked || 0,
                clickedTracked: row.clickedTracked || 0,
                replied: row.replied || 0,
                bounced: row.bounced || 0,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
            }));

            // Cache the results
            await setAnalyticsCache(cacheKey, data, CACHE_TTL.REAL_TIME * 2);

            return NextResponse.json({
                success: true,
                data,
                cached: false,
                timestamp: new Date().toISOString(),
            });

        } finally {
            await client.end();
        }

    } catch (error) {
        console.error('Cross-domain analytics API error:', error);

        // Check if it's a table not found error (graceful degradation)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (errorMessage.includes('does not exist') || errorMessage.includes('relation')) {
            return NextResponse.json({
                success: true,
                data: [],
                cached: false,
                timestamp: new Date().toISOString(),
                warning: 'Cross-domain analytics table not found - returning empty data',
            });
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch cross-domain analytics',
                message: errorMessage,
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}
