"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingLayout } from "@/components/landing/LandingLayout";
import { AuthTemplate } from "@/components/auth/AuthTemplate";
import { toast } from "sonner";

interface VerificationResult {
  success: boolean;
  message: string;
  email?: string;
}

export default function VerifyEmailPage() {
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setVerificationResult({
        success: false,
        message: "No verification token provided. Please check your email for the verification link."
      });
      setIsVerifying(false);
      return;
    }

    verifyToken(token);
  }, [token]);

  const verifyToken = async (token: string) => {
    setIsVerifying(true);
    try {
      const response = await fetch('/api/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setVerificationResult({
          success: true,
          message: "Your email has been successfully verified! You can now log in to your account.",
          email: data.email,
        });
      } else {
        // Handle different types of verification errors
        let errorMessage = data.error || "Verification failed. The link may be invalid or expired.";
        
        if (data.expired) {
          errorMessage = "This verification link has expired. Please request a new one.";
        } else if (data.used) {
          errorMessage = "This verification link has already been used. Please request a new one.";
        }

        setVerificationResult({
          success: false,
          message: errorMessage,
          email: data.email,
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationResult({
        success: false,
        message: "An error occurred during verification. Please try again later.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendEmail = async () => {
    if (!verificationResult?.email) return;

    setIsResending(true);
    try {
      const response = await fetch('/api/emails/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'verification',
          email: verificationResult.email,
          userName: verificationResult.email.split('@')[0],
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Show success message and redirect to email confirmation
        toast.success("A new verification link has been sent to your email.", {
          duration: 4000,
        });
        router.push('/email-confirmation');
      } else {
        toast.error(data.error || "Failed to resend verification email. Please try again.", {
          duration: 4000,
        });
      }
    } catch (error) {
      console.error('Error resending verification email:', error);
      toast.error("Failed to resend verification email. Please try again.", {
        duration: 4000,
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleGoToLogin = () => {
    router.push('/login');
  };

  const icon = isVerifying ? Loader2 : verificationResult?.success ? CheckCircle : XCircle;
  const title = isVerifying ? "Verifying your email..." : 
                verificationResult?.success ? "Email Verified!" : "Verification Failed";
  const description = isVerifying ? "Please wait while we verify your email address." :
                     verificationResult?.success ? 
                     "Your account has been successfully activated." :
                     "There was an issue with your email verification.";

  return (
    <LandingLayout>
      <AuthTemplate
        mode="form"
        icon={icon}
        title={title}
        description={description}
      >
        <div className="space-y-6 text-center">
          {isVerifying ? (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Status Message */}
              <div className={`p-4 rounded-lg ${
                verificationResult?.success 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                <p className="text-sm">{verificationResult?.message}</p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {verificationResult?.success ? (
                  <Button onClick={handleGoToLogin} className="w-full">
                    Go to Login
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={handleResendEmail} 
                      disabled={isResending}
                      variant="outline"
                      className="w-full"
                    >
                      {isResending ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Resend verification email
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      onClick={handleGoToLogin}
                      variant="ghost"
                      className="w-full"
                    >
                      Go to Login
                    </Button>
                  </>
                )}
              </div>

              {/* Additional Help Text */}
              {!verificationResult?.success && (
                <p className="text-xs text-muted-foreground">
                  If you&apos;re still having trouble, please contact our support team.
                </p>
              )}
            </>
          )}
        </div>
      </AuthTemplate>
    </LandingLayout>
  );
}

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';
