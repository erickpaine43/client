"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SettingsLoadingSkeleton } from "@/components/settings/common/SettingsLoadingSkeleton";
import { SettingsErrorState } from "@/components/settings/common/SettingsErrorState";
import { showBillingUpdateSuccess } from "@/components/settings/common/SettingsSuccessNotification";
import { useServerAction } from "@/hooks/useServerAction";
import { getBillingDataForSettings as getBillingInfo } from "@/lib/actions/billing";
import { Loader2 } from "lucide-react";
import type { BillingData } from "@/types/settings";

// Type guards
const isValidPlanDetails = (
  planDetails: unknown
): planDetails is BillingData["planDetails"] => {
  if (typeof planDetails !== "object" || planDetails === null) return false;
  const obj = planDetails as Record<string, unknown>;
  return (
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    typeof obj.isMonthly === "boolean" &&
    typeof obj.price === "number" &&
    typeof obj.description === "string" &&
    typeof obj.maxEmailAccounts === "number" &&
    typeof obj.maxCampaigns === "number" &&
    typeof obj.maxEmailsPerMonth === "number"
  );
};

const isValidPaymentMethod = (
  paymentMethod: unknown
): paymentMethod is BillingData["paymentMethod"] => {
  if (typeof paymentMethod !== "object" || paymentMethod === null) return false;
  const obj = paymentMethod as Record<string, unknown>;
  return (
    typeof obj.lastFour === "string" &&
    typeof obj.expiry === "string" &&
    typeof obj.brand === "string"
  );
};

const isValidInvoice = (
  invoice: unknown
): invoice is BillingData["billingHistory"][0] => {
  if (typeof invoice !== "object" || invoice === null) return false;
  const obj = invoice as Record<string, unknown>;
  return (
    typeof obj.date === "string" &&
    typeof obj.description === "string" &&
    typeof obj.amount === "string" &&
    typeof obj.method === "string"
  );
};

const isBillingData = (billing: unknown): billing is BillingData => {
  if (typeof billing !== "object" || billing === null) return false;
  const obj = billing as Record<string, unknown>;
  return (
    typeof obj.renewalDate === "string" &&
    typeof obj.emailAccountsUsed === "number" &&
    typeof obj.campaignsUsed === "number" &&
    typeof obj.emailsPerMonthUsed === "number" &&
    isValidPlanDetails(obj.planDetails) &&
    (obj.paymentMethod === null || isValidPaymentMethod(obj.paymentMethod)) &&
    Array.isArray(obj.billingHistory) &&
    obj.billingHistory.every(isValidInvoice)
  );
};

const BillingSettings: React.FC<{ billing?: BillingData }> = ({
  billing: initialBilling,
}) => {
  const [updateLoading, setUpdateLoading] = useState(false);

  // Server action for fetching billing data
  const billingAction = useServerAction(() => getBillingInfo(), {
    onError: (error) => {
      console.error("Failed to load billing information:", error);
    },
  });

  // Load billing data on mount if not provided
  useEffect(() => {
    if (!initialBilling) {
      billingAction.execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialBilling]);

  const handlePlanChange = async () => {
    setUpdateLoading(true);
    try {
      // Simulate plan change
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showBillingUpdateSuccess();
    } catch (error) {
      console.error("Failed to change plan:", error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handlePaymentMethodChange = async () => {
    setUpdateLoading(true);
    try {
      // Simulate payment method change
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showBillingUpdateSuccess();
    } catch (error) {
      console.error("Failed to update payment method:", error);
    } finally {
      setUpdateLoading(false);
    }
  };

  // Show loading state
  if (billingAction.loading && !billingAction.data && !initialBilling) {
    return <SettingsLoadingSkeleton variant="cards" itemCount={4} />;
  }

  // Show error state
  if (billingAction.error && !initialBilling) {
    return (
      <SettingsErrorState
        error={billingAction.error?.message ?? "Failed to load billing data"}
        errorType="network"
        onRetry={() => billingAction.execute()}
        retryLoading={billingAction.loading}
        canRetry={billingAction.canRetry}
        variant="card"
        showDetails
      />
    );
  }

  const billing = initialBilling || billingAction.data;

  if (!billing) {
    return (
      <SettingsErrorState
        error="No billing information available"
        errorType="generic"
        variant="card"
      />
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing Information</CardTitle>
        <CardDescription>
          Manage your subscription and billing details.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-md border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">
                {isValidPlanDetails(billing.planDetails)
                  ? billing.planDetails.name
                  : "Unknown Plan"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isValidPlanDetails(billing.planDetails)
                  ? `${billing.planDetails.price} / month`
                  : "Unknown price"}{" "}
                • Renews on {billing.renewalDate}{" "}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handlePlanChange}
              disabled={updateLoading}
            >
              {updateLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Change Plan"
              )}
            </Button>
          </div>

          {isBillingData(billing) && (
            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-sm">
                <span>Email accounts</span>
                <span>
                  {billing.emailAccountsUsed || 0} /{" "}
                  {isValidPlanDetails(billing.planDetails)
                    ? billing.planDetails.maxEmailAccounts
                    : "Unknown"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Campaigns</span>
                <span>{billing.campaignsUsed || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Emails per month</span>
                <span>
                  {(billing.emailsPerMonthUsed || 0).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Payment Method</h3>
          {billing.paymentMethod &&
          isValidPaymentMethod(billing.paymentMethod) ? (
            <div className="flex items-center justify-between rounded-md border p-4">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-14 rounded-md bg-gray-100 dark:bg-muted flex items-center justify-center">
                  {/* Basic card icon - replace with actual icon based on billingData.paymentMethod.brand if available */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <line x1="2" x2="22" y1="10" y2="10" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">
                    •••• •••• •••• {billing.paymentMethod.lastFour}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Expires {billing.paymentMethod.expiry}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePaymentMethodChange}
                disabled={updateLoading}
              >
                {updateLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Change"
                )}
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-md border p-4">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-14 rounded-md bg-gray-100 dark:bg-muted flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <line x1="2" x2="22" y1="10" y2="10" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">No payment method on file</p>
                  <p className="text-xs text-muted-foreground">
                    Add a payment method to continue service
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePaymentMethodChange}
                disabled={updateLoading}
              >
                {updateLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Add"
                )}
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Billing History</h3>
          <div className="rounded-md border">
            {billing.billingHistory.map((item, index) => (
              <div
                key={index}
                className={`p-4 flex items-center justify-between text-sm ${index > 0 ? "border-t" : ""}`}
              >
                <div
                  key={index}
                  className={`p-4 flex items-center justify-between text-sm ${
                    index > 0 ? "border-t" : ""
                  }`}
                >
                  <p className="font-medium">
                    {isValidInvoice(item) ? item.date : "Unknown date"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isValidInvoice(item)
                      ? item.description
                      : "Unknown description"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {isValidInvoice(item) ? item.amount : "Unknown amount"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isValidInvoice(item) ? item.method : "Unknown method"}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Button variant="link" size="sm">
              View All Invoices
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BillingSettings;
