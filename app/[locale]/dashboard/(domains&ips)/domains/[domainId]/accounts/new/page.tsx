"use client";
import { use } from "react";
import { Button } from "@/components/ui/button";
import EmailAccountForm from "@/components/domains/email-account-form";
import { type EmailAccountFormValues } from "@/types/forms";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

function NewAccountClient({ params }: { params: Promise<{ domainId: string }> }) {
  const { domainId } = use(params);
  const domain = {
    id: parseInt(domainId),
    name: "example.com",
  };

  const handleSubmit = async (data: EmailAccountFormValues) => {
    // TODO: Implement API call to create account
    console.log("Creating account:", { ...data, domain: domain.name });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/domains/${domain.id}/accounts`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">New Email Account</h1>
          <p className="text-muted-foreground">
            Add a new email account for {domain.name}
          </p>
        </div>
      </div>

      <EmailAccountForm
        initialData={{
          email: `@${domain.name}`,
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

// Server component
export default function NewDomainAccountPage({
  params,
}: {
  params: Promise<{ domainId: string }>;
}) {
  return <NewAccountClient params={params} />;
}
