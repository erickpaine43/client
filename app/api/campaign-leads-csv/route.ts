import { NextResponse } from 'next/server';
// import { mockCampaignDetail } from '@/components/campaigns/data/mock-data';

// Sample campaign leads data for CSV export
const campaignLeadsData = [
  ["Email", "Name", "Status", "First Contact", "Campaign"],
  ["jane.doe@softwareco.com", "Jane Doe", "Replied", "2024-01-15", "Software CEOs Outreach"],
  ["john.smith@techstartup.io", "John Smith", "Clicked", "2024-01-16", "Software CEOs Outreach"],
  ["sarah.wilson@cloudtech.com", "Sarah Wilson", "Opened", "2024-01-17", "Software CEOs Outreach"],
  ["mike.brown@salesforce.com", "Mike Brown", "Sent", "2024-01-18", "Software CEOs Outreach"],
  ["emma.davis@datacorp.net", "Emma Davis", "Replied", "2024-01-19", "Software CEOs Outreach"],
  ["alex.johnson@devtools.io", "Alex Johnson", "Clicked", "2024-01-20", "Software CEOs Outreach"],
  ["lisa.garcia@webapps.com", "Lisa Garcia", "Opened", "2024-01-21", "Software CEOs Outreach"],
  ["david.perez@machinelearning.co", "David Perez", "Sent", "2024-01-22", "Software CEOs Outreach"],
  ["anna.lee@analytics.com", "Anna Lee", "Replied", "2024-01-23", "Software CEOs Outreach"],
];

export async function GET() {
  const csvContent = campaignLeadsData.map((row) =>
    row.map((cell) => `"${cell}"`).join(","),
  ).join("\n");

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="campaign-leads.csv"',
    },
  });
}
