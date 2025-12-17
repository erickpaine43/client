import { NextResponse } from "next/server";
import { mockAccountData } from "@/lib/data/accounts.mock";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ domainId: string; accountId: string }> },
) {
  const { domainId, accountId } = await params;

  // In a real application, you would fetch data from your database
  // using domainId and accountId
  console.log(`Fetching data for domain: ${domainId}, account: ${accountId}`);

  // For now, return mock data
  // You can customize this mock data based on the params if needed
  const accountData = {
    ...mockAccountData,
    id: accountId,
  };

  if (accountId === "notfound") {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  return NextResponse.json(accountData);
}
