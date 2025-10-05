"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { User } from "lucide-react";
import { LandingLayout } from "@/components/landing/LandingLayout";
import { signupContent } from "./content";
import { AuthTemplate } from "@/components/auth/AuthTemplate";
import SignUpFormView from "./SignUpFormView";

export default function SignUpPage() {
  const { user } = useAuth();

  const icon = User;
  const title = user
    ? "You are already signed in."
    : signupContent.header.title;
  const description = user ? "" : signupContent.header.description;
  const mode = user ? "loggedIn" : "form";
  const footer = user ? undefined : (
      <p className="text-xs text-muted-foreground">
        {signupContent.footer.haveAccount}{" "}
        <Link href="/" className="underline font-medium text-primary">
          {signupContent.footer.login}
        </Link>
      </p>
  );

  return (
    <LandingLayout>
      <AuthTemplate
        mode={mode}
        icon={icon}
        title={title}
        description={description}
        footer={footer}
      >
        {user ? undefined : <SignUpFormView />}
      </AuthTemplate>
    </LandingLayout>
  );
}

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';
