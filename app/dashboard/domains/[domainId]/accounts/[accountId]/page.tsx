import { notFound } from "next/navigation";
import AccountWarmupDetailsContent from "./content";
import { AccountDetails } from "@/types/mailbox";

type AccountPageParams = Promise<{
  domainId: string;
  accountId: string;
}>;

async function getAccountDetails(
  domainId: string,
  accountId: string,
): Promise<AccountDetails | null> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/domains/${domainId}/accounts/${accountId}`,
    {
      method: "GET",
      cache: "no-store", // Ensure fresh data
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!res.ok) {
    if (res.status === 404) {
      return null; // Account not found
    }
    // Log the error for server-side inspection
    console.error(
      "Failed to fetch account details:",
      res.status,
      await res.text(),
    );
    // For other errors, you might want to throw or handle differently
    throw new Error("Failed to fetch account details");
  }

  return res.json();
}

export default async function AccountDetailsPage({
  params,
}: {
  params: AccountPageParams;
}) {
  const { domainId, accountId } = await params;
  const accountDetails = await getAccountDetails(domainId, accountId);

  if (!accountDetails) {
    notFound(); // Triggers the not-found UI
  }

  return <AccountWarmupDetailsContent accountDetails={accountDetails} />;
}
