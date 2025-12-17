import { NextResponse } from 'next/server';
import { SAMPLE_CSV_DATA } from '@/lib/data/leads';

// Server action to download sample CSV
export async function GET() {
  const csvContent = SAMPLE_CSV_DATA.map((row) =>
    row.map((cell) => `"${cell}"`).join(","),
  ).join("\n");

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="sample-leads.csv"',
    },
  });
}
