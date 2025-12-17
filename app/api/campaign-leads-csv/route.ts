import { NextResponse } from 'next/server';
import { campaignLeadsData } from '@/lib/data/leads';

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
