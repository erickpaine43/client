"use client";

import Link from "next/link";
import { config } from "@/lib/config";
import {
  getBillingDataForSettings,
} from "@/lib/actions/billing";
import { useServerAction } from "@/hooks/useServerAction";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

// Simple loading skeleton component
function BillingLoadingSkeleton() {
  return (
    <div className="bg-white shadow sm:rounded-lg animate-pulse">
      <div className="px-4 py-5 sm:p-6">
        <div className="h-6 bg-gray-200 rounded w-48 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-64 mb-4" />
        <div className="rounded-md bg-gray-50 px-6 py-5">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-40" />
        </div>
      </div>
    </div>
  );
}

export default function BillingSettingsPage() {
  // Server action hooks for billing data
  const billingOptions = {
    onError: (error: string) => {
      console.error("Failed to load billing data", error);
    },
  };

  const billingDataAction = useServerAction(
    getBillingDataForSettings,
    billingOptions
  );
  const { execute: loadBilling } = billingDataAction;

  // Load billing data on component mount
  useEffect(() => {
    loadBilling();
  }, [loadBilling]);

  // Show loading skeleton while data is loading
  if (billingDataAction.loading && !billingDataAction.data) {
    return <BillingLoadingSkeleton />;
  }

  // Show error state if data failed to load
  if (billingDataAction.error && !billingDataAction.data) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">Failed to load billing data</p>
          <Button
            onClick={loadBilling}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Show fallback if no data available
  if (!billingDataAction.data) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No billing data available</p>
        </div>
      </div>
    );
  }

  const billingData = billingDataAction.data;

  // Company billing data - now from API based on billing model
  const companyBilling = {
    currentPlanName: billingData.planDetails.name, // Dynamic from billing data
    // Add more company-related billing fields here as needed
  };

  const planType = companyBilling.currentPlanName;

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Billing & Plan
        </h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>Manage your subscription and view billing history.</p>
        </div>

        <div className="mt-5">
          <div className="rounded-md bg-gray-50 px-6 py-5 sm:flex sm:items-start sm:justify-between">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 sm:mt-0 sm:ml-4">
                <div className="text-sm font-medium text-gray-900">
                  Current Plan
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  You are currently on the{" "}
                  <span className="font-semibold">
                    {planType.charAt(0) + planType.slice(1).toLowerCase()}
                  </span>{" "}
                  plan.
                </div>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-6 sm:flex-shrink-0">
              {planType === "FREE" ? (
                <Link
                  href={config.stripe.checkoutUrl} // Link to upgrade checkout
                  target="_blank" // Open Stripe in new tab
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Upgrade Plan
                </Link>
              ) : (
                <Link
                  href={config.stripe.portalUrl} // Link to Stripe Customer Portal
                  target="_blank" // Open Stripe in new tab
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Manage Subscription
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-500">
            Billing management is handled by Stripe. Clicking the button above
            will redirect you to Stripe&apos;s secure portal.
          </p>
          {/* Add billing history section later if needed */}
        </div>
      </div>
    </div>
  );
}
