"use client";

import React from "react";
import { User } from "lucide-react";
import { LandingLayout } from "@/components/landing/LandingLayout";
import { AuthTemplate } from "@/components/auth/AuthTemplate";
import { EmailConfirmationView } from "./EmailConfirmationView";

export default function EmailConfirmationPage() {
  const icon = User;
  const title = "Check your email";
  const description = "We've sent you a verification link to activate your account.";
  const mode = "form";

  return (
    <LandingLayout>
      <AuthTemplate
        mode={mode}
        icon={icon}
        title={title}
        description={description}
      >
        <EmailConfirmationView />
      </AuthTemplate>
    </LandingLayout>
  );
}

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';
