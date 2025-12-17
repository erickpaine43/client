"use client";

import { ChangePlanTrigger } from "@/components/settings/billing/change-plan-dialog";
import EditAddressTrigger from "@/components/settings/billing/edit-trigger-dialog";
import InvoicesTable from "@/components/settings/billing/invocies-table";
import UpdateCardDialogTrigger from "@/components/settings/billing/update-card-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  CreditCard,
  Crown,
  Building,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import {
  getBillingDataForSettings,
  updateBillingInfo,
} from "@/lib/actions/billing";
import { updateCompanyInfo, getUserSettings } from "@/lib/actions/settings";
import {
  useServerAction,
  useServerActionWithParams,
} from "@/hooks/useServerAction";
import { BillingLoadingSkeleton } from "@/components/settings/billing/BillingLoadingSkeleton";
import {
  SettingsErrorBoundary,
  SettingsErrorFallback,
} from "@/components/settings/SettingsErrorBoundary";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function BillingTab() {
  // Memoized options to keep stable references
  const billingOptions = useMemo(
    () => ({
      onError: (error: string) => {
        toast.error("Failed to load billing data", { description: error });
      },
    }),
    []
  );

  // Server action hooks
  const billingDataAction = useServerAction(
    getBillingDataForSettings,
    billingOptions
  );
  const { execute: loadBilling } = billingDataAction;

  const updateOptions = useMemo(
    () => ({
      onSuccess: () => {
        toast.success("Billing information updated successfully");
        // Refresh billing data after update
        loadBilling();
      },
      onError: (error: string) => {
        toast.error("Failed to update billing information", {
          description: error,
        });
      },
    }),
    [loadBilling]
  );

  const updateBillingAction = useServerActionWithParams(
    updateBillingInfo,
    updateOptions
  );

  const updateCompanyOptions = useMemo(
    () => ({
      onSuccess: () => {
        toast.success("Company name updated successfully");
        // Refresh billing data in case it includes company info
        loadBilling();
      },
      onError: (error: string) => {
        toast.error("Failed to update company name", {
          description: error,
        });
      },
    }),
    [loadBilling]
  );

  const updateCompanyAction = useServerActionWithParams(
    updateCompanyInfo,
    updateCompanyOptions
  );

  const companyOptions = useMemo(
    () => ({
      onError: (error: string) => {
        toast.error("Failed to load company information", { description: error });
      },
    }),
    []
  );

  const companyDataAction = useServerAction(
    getUserSettings,
    companyOptions
  );
  const { execute: loadCompanyData } = companyDataAction;

  // Load billing data on component mount
  useEffect(() => {
    loadBilling();
    loadCompanyData();
  }, [loadBilling, loadCompanyData]);

  // Handle company name update
  const handleCompanyNameUpdate = async (newName: string) => {
    if (!billingDataAction.data) return;

    await updateCompanyAction.execute({
      name: newName,
    });
    // Refresh company data after update
    loadCompanyData();
  };

  // Show loading skeleton while data is loading
  if (billingDataAction.loading && !billingDataAction.data) {
    return <BillingLoadingSkeleton />;
  }

  // Show error state if data failed to load
  if (billingDataAction.error && !billingDataAction.data) {
    return (
      <SettingsErrorFallback
        error={billingDataAction.error?.message ?? "An error occurred"}
        retry={loadBilling}
      />
    );
  }

  // Show fallback if no data available
  if (!billingDataAction.data) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No billing data available</p>
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

  const billingData = billingDataAction.data;

  return (
    <SettingsErrorBoundary>
      <div className="space-y-5">
        {/* Current Plan Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Current Plan</CardTitle>
            <Badge>
              <Crown className="w-4 h-4 mr-1" />
              <span>Active</span>
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <Card
                className={cn(
                  "border-primary/70 bg-gradient-to-br from-primary/20 to-indigo-50"
                )}
              >
                <CardContent>
                  <h3 className="mb-1 text-lg font-semibold text-foreground">
                    {billingData.planDetails.name} Plan
                  </h3>
                  <p className="text-2xl font-bold text-primary">
                    ${billingData.planDetails.price}/
                    {billingData.planDetails.isMonthly ? "month" : "year"}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-muted/50">
                <CardContent>
                  <h4 className="mb-1 text-sm font-medium text-muted-foreground">
                    Email Accounts
                  </h4>
                  <p className="text-xl font-semibold text-foreground">
                    {billingData.emailAccountsUsed} /{" "}
                    {billingData.planDetails.maxEmailAccounts === 0
                      ? "∞"
                      : billingData.planDetails.maxEmailAccounts}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-muted/50">
                <CardContent>
                  <h4 className="mb-1 text-sm font-medium text-muted-foreground">
                    Campaigns
                  </h4>
                  <p className="text-xl font-semibold text-foreground">
                    {billingData.campaignsUsed} /{" "}
                    {billingData.planDetails.maxCampaigns === 0
                      ? "∞"
                      : billingData.planDetails.maxCampaigns}
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
          <CardFooter className="ml-auto">
            <ChangePlanTrigger title="Change Plan" />
          </CardFooter>
        </Card>

        {/* Payment Method Card */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            {billingData.paymentMethod ? (
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-white p-2 rounded-lg border">
                    <CreditCard className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {billingData.paymentMethod.brand} ending in{" "}
                      {billingData.paymentMethod.lastFour}
                    </p>
                    <p className="text-sm text-gray-600">
                      Expires {billingData.paymentMethod.expiry}
                    </p>
                  </div>
                </div>
                <UpdateCardDialogTrigger title="Update Card" />
              </div>
            ) : (
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-white p-2 rounded-lg border">
                    <CreditCard className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">No payment method</p>
                    <p className="text-sm text-gray-600">Add a payment method to continue</p>
                  </div>
                </div>
                <UpdateCardDialogTrigger title="Add Card" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Company Information Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>
              <Building className="w-5 h-5 inline mr-2" />
              Company Information
            </CardTitle>
            <button
              className="text-sm text-blue-600 hover:text-blue-800 underline disabled:opacity-50"
              disabled={updateBillingAction.loading}
              onClick={() => {
                const currentName = companyDataAction.data?.companyInfo.name || "Company";
                const newCompanyName = prompt(
                  "Enter company name:",
                  currentName
                );
                if (newCompanyName && newCompanyName.trim() && newCompanyName.trim() !== currentName) {
                  handleCompanyNameUpdate(newCompanyName.trim());
                }
              }}
            >
              {updateBillingAction.loading ? "Updating..." : "Edit Company"}
            </button>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Company Name
                    </label>
                    <p className="font-medium text-gray-900">
                      {companyDataAction.data?.companyInfo.name || "Loading..."}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Industry
                  </label>
                  <p className="text-gray-600">
                    {companyDataAction.data?.companyInfo.industry || "Technology Services"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Company Size
                  </label>
                  <p className="text-gray-600">
                    {companyDataAction.data?.companyInfo.size || "51-200 employees"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing Address Card */}
        <Card>
          <CardHeader className="flex-center-between">
            <CardTitle>Billing Address</CardTitle>
            <EditAddressTrigger title="Edit Address" />
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-1">
                <p className="font-medium text-gray-900">
                  {companyDataAction.data?.companyInfo.name || "Company"}
                </p>
                <p className="text-gray-600">123 Business Street</p>
                <p className="text-gray-600">San Francisco, CA 94105</p>
                <p className="text-gray-600">United States</p>
                <p className="text-sm text-gray-500 mt-2">
                  VAT ID: US123456789
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Invoices Card */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <InvoicesTable />
          </CardContent>
        </Card>

        {/* Loading overlay for updates */}
        {updateBillingAction.loading && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Updating billing information...</span>
            </div>
          </div>
        )}
      </div>
    </SettingsErrorBoundary>
  );
}

export default BillingTab;
