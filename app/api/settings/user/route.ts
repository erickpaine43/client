import { NextResponse } from 'next/server';

/**
 * STUB: User settings endpoint
 * Added to prevent 404 errors in console during development
 * Real implementation pending
 */
export async function GET() {
    // Return mock user preferences matching the expected schema
    return NextResponse.json({
        id: 'stub-user-id',
        theme: 'light',
        language: 'en',
        timezone: 'America/New_York',
        emailNotifications: true,
        pushNotifications: false,
        weeklyReports: true,
        marketingEmails: false,
        sidebarCollapsed: false,
        tableDensity: 'comfortable',
        sidebarView: 'expanded',
        updatedAt: new Date().toISOString()
    });
}
