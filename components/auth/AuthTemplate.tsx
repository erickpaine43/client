"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { UserInfo, SignOutButton } from "@niledatabase/react";

interface AuthTemplateProps {
  mode: "form" | "loggedIn";
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string | React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  error?: string | null;
}

export function AuthTemplate({
  mode,
  icon,
  title,
  description,
  children,
  footer,
  error,
}: AuthTemplateProps) {
  const router = useRouter();
  const IconComponent = icon;

  return (
    <div className="flex-grow flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          {IconComponent && (
            <IconComponent className="mx-auto h-8 w-8 mb-2 text-primary" />
          )}
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mode === "form" ? (
            <>
              {children}
              {error && (
                <Alert variant="destructive">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </>
          ) : (
            <>
              <UserInfo />
            </>
          )}
        </CardContent>
        {mode === "loggedIn" && (
          <CardFooter className="flex justify-between">
            <SignOutButton className="bg-red-500 hover:bg-red-700 hover:text-white hover:rounded-md hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300 ease-in-out" />
            <Button className="py-5" onClick={() => router.push("/dashboard")}>
              <Terminal className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </CardFooter>
        )}
        {mode === "form" && footer && <CardFooter>{footer}</CardFooter>}
      </Card>
    </div>
  );
}
