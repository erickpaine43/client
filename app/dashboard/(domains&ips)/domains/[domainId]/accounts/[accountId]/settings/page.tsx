"use client";

import { use, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import EmailAccountForm from "@/components/domains/email-account-form";
import { EmailAccountFormValues } from "@/types/forms";
import { getAccountDetails } from "@/lib/actions/domains";

// Define the type for the data EmailAccountForm expects for its initialData prop
type EmailAccountFormInitialData = Partial<EmailAccountFormValues> & {
  domainAuthStatus?: {
    spfVerified?: boolean;
    dkimVerified?: boolean;
    dmarcVerified?: boolean;
  };
};

function AccountSettingsClient({
  params,
}: {
  params: Promise<{ domainId: string; accountId: string }>;
}) {
  const { domainId, accountId } = use(params);

  const [initialData, setInitialData] =
    useState<EmailAccountFormInitialData | null>(null);
  const [isLoading, setIsLoading] = useState(true); // For form submission
  const [isFetchingData, setIsFetchingData] = useState(true); // For initial data load

  useEffect(() => {
    async function loadAccountData() {
      setIsFetchingData(true);
      try {
        const data = await getAccountDetails(Number(accountId));
        setInitialData(data);
      } catch (error) {
        console.error("Failed to fetch account details:", error);
        // Handle error (e.g., show toast, set error state)
      } finally {
        setIsFetchingData(false);
      }
    }
    loadAccountData();
  }, [accountId]);

  const handleSubmit = async (data: EmailAccountFormValues) => {
    setIsLoading(true);
    console.log("Submitting account settings:", data);
    // TODO: Implement actual API call to update account settings
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API delay
    // On success:
    // toast.success("Account settings updated!");
    // On error:
    // toast.error("Failed to update settings.");
    setIsLoading(false);
  };

  if (isFetchingData) {
    return (
      <div className="container mx-auto py-6">Loading account settings...</div>
    ); // Or a proper skeleton loader
  }

  if (!initialData) {
    return (
      <div className="container mx-auto py-6">
        Failed to load account settings. Please try again.
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          {/* TODO: Update this link if the account detail view path changes */}
          <Link href={`/dashboard/domains/${domainId}/accounts/${accountId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <p className="text-muted-foreground">
            {initialData.email || `Account ID: ${accountId}`}
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Use the EmailAccountForm component */}
        <EmailAccountForm
          initialData={initialData}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          isEditing={true}
        />
      </div>
    </div>
  );
}

// Server component that fetches params and renders client component
export default function AccountSettingsPage({
  params,
}: {
  params: Promise<{ domainId: string; accountId: string }>;
}) {
  return <AccountSettingsClient params={params} />;
}
