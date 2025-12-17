# Actions API Documentation

## Overview

This document provides comprehensive API documentation for all action modules in the refactored actions system. All actions follow standardized patterns for error handling, authentication, validation, and response formats.

## Table of Contents

1. [Core Types and Interfaces](#core-types-and-interfaces)
2. [Authentication Patterns](#authentication-patterns)
3. [Error Handling](#error-handling)
4. [Validation Patterns](#validation-patterns)
5. [Module APIs](#module-apis)
6. [Response Formats](#response-formats)
7. [Rate Limiting](#rate-limiting)
8. [Performance Monitoring](#performance-monitoring)

## Core Types and Interfaces

### ActionResult<T>

All actions return a standardized `ActionResult<T>` type:

```typescript
interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: ActionError;
}
```

### ActionError

Standardized error information:

```typescript
interface ActionError {
  type:
    | "auth"
    | "validation"
    | "network"
    | "server"
    | "rate_limit"
    | "permission"
    | "not_found"
    | "conflict";
  message: string;
  code?: string;
  field?: string;
  details?: Record<string, unknown>;
}
```

### ActionContext

Request context information:

```typescript
interface ActionContext {
  userId: string;
  companyId?: string;
  timestamp: number;
  requestId: string;
}
```

## Authentication Patterns

### requireAuth()

Requires user authentication and returns context:

```typescript
const authResult = await requireAuth();
if (!authResult.success) {
  return authResult; // Returns auth error
}

const { userId, companyId } = authResult.data;
```

### requireUserId()

Simple user ID requirement:

```typescript
const userIdResult = await requireUserId();
if (!userIdResult.success) {
  return userIdResult;
}

const userId = userIdResult.data;
```

## Error Handling

### ErrorFactory

Standardized error creation:

```typescript
import { ErrorFactory } from "@/lib/actions/core";

// Authentication errors
ErrorFactory.authRequired();
ErrorFactory.invalidCredentials();
ErrorFactory.sessionExpired();

// Validation errors
ErrorFactory.validation("Invalid email format", "email");
ErrorFactory.required("Name is required", "name");
ErrorFactory.invalidFormat("Invalid phone number", "phone");

// Server errors
ErrorFactory.server("Database connection failed");
ErrorFactory.notFound("User not found");
ErrorFactory.conflict("Email already exists");

// Rate limiting
ErrorFactory.rateLimit("Too many requests");
ErrorFactory.rateLimitExceeded("Daily limit exceeded", 86400);
```

### withErrorHandling()

Automatic error handling wrapper:

```typescript
return await withErrorHandling(async () => {
  // Your operation that might throw
  return await performOperation();
});
```

## Validation Patterns

### Object Validation

```typescript
import { validateObject, Validators } from "@/lib/actions/core";

const validation = validateObject(data, {
  name: Validators.name,
  email: Validators.email,
  phone: Validators.phone,
  age: (value) => validateNumber(value, "age", 18, 120),
});

if (!validation.isValid) {
  return validationToActionResult(validation);
}

const validatedData = validation.data; // Fully typed
```

### Available Validators

```typescript
// Basic validators
Validators.email(value)           // Email format validation
Validators.name(value)            // Name validation (2-50 chars)
Validators.phone(value)           // Phone number validation
Validators.url(value)             // URL format validation
Validators.dateString(value)      // ISO date string validation
Validators.description(value)     // Description validation (max 500 chars)

// Custom validators
validateRequired(value, fieldName)
validateString(value, fieldName, minLength?, maxLength?)
validateNumber(value, fieldName, min?, max?)
validateArray(value, fieldName, minLength?, maxLength?)
validateEnum(value, fieldName, allowedValues)
validateBoolean(value, fieldName)
```

## Module APIs

### Analytics Module

#### Billing Analytics

```typescript
// Get current usage metrics
getCurrentUsageMetrics(): Promise<ActionResult<UsageMetrics>>

// Get billing analytics with filters
getBillingAnalytics(filters?: {
  startDate?: string;
  endDate?: string;
  includeProjections?: boolean;
}): Promise<ActionResult<BillingAnalyticsData>>

// Get cost analysis
getCostAnalytics(filters?: {
  startDate?: string;
  endDate?: string;
  granularity?: "daily" | "weekly" | "monthly";
}): Promise<ActionResult<CostAnalyticsData>>

// Export billing data
exportBillingAnalytics(format: "csv" | "json"): Promise<ActionResult<ExportResult>>
```

#### Campaign Analytics

```typescript
// Get campaign performance metrics
getCampaignPerformanceMetrics(campaignIds: string[]): Promise<ActionResult<CampaignMetrics[]>>

// Get all campaign analytics
getCampaignAnalytics(filters?: {
  startDate?: string;
  endDate?: string;
  campaignIds?: string[];
  includeSequences?: boolean;
}): Promise<ActionResult<CampaignAnalyticsData>>

// Get sequence step analytics
getSequenceStepAnalytics(sequenceId: string): Promise<ActionResult<SequenceStepAnalytics>>

// Bulk update campaign analytics
bulkUpdateCampaignAnalytics(updates: CampaignAnalyticsUpdate[]): Promise<ActionResult<BulkUpdateResult>>
```

#### Domain Analytics

```typescript
// Get domain health metrics
getDomainHealthMetrics(domainIds: string[]): Promise<ActionResult<DomainHealthMetrics[]>>

// Get domain analytics
getDomainAnalytics(filters?: {
  startDate?: string;
  endDate?: string;
  domainIds?: string[];
  includeReputation?: boolean;
}): Promise<ActionResult<DomainAnalyticsData>>

// Compare domain performance
getDomainPerformanceComparison(domainIds: string[]): Promise<ActionResult<DomainComparison>>
```

### Billing Module

#### Main Billing Operations

```typescript
// Get complete billing information
getBillingInfo(): Promise<ActionResult<BillingInfo>>

// Update billing information
updateBillingInfo(data: {
  billingAddress?: BillingAddress;
  taxId?: string;
  companyName?: string;
}): Promise<ActionResult<BillingInfo>>

// Get subscription plans
getSubscriptionPlans(): Promise<ActionResult<SubscriptionPlan[]>>

// Update subscription plan
updateSubscriptionPlan(planId: string, options?: {
  effectiveDate?: string;
  promoCode?: string;
}): Promise<ActionResult<SubscriptionUpdateResult>>
```

#### Payment Methods

```typescript
// Add payment method
addPaymentMethod(data: {
  type: "visa" | "mastercard" | "amex" | "discover";
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  holderName: string;
  isDefault?: boolean;
}): Promise<ActionResult<PaymentMethod>>

// Remove payment method
removePaymentMethod(paymentMethodId: string): Promise<ActionResult<void>>

// Set default payment method
setDefaultPaymentMethod(paymentMethodId: string): Promise<ActionResult<PaymentMethod>>

// Get all payment methods
getPaymentMethods(): Promise<ActionResult<PaymentMethod[]>>
```

#### Usage Tracking

```typescript
// Get usage metrics
getUsageMetrics(): Promise<ActionResult<UsageMetrics>>

// Get usage with calculations
getUsageWithCalculations(): Promise<ActionResult<{
  usage: UsageMetrics;
  percentages: UsagePercentages;
  overage: OverageInfo;
  projection: UsageProjection;
}>>

// Get usage history
getUsageHistory(metric: string, period: "daily" | "weekly" | "monthly"): Promise<ActionResult<UsageHistoryData>>
```

### Team Module

#### Member Management

```typescript
// Get team members
getTeamMembers(filters?: {
  role?: string;
  status?: "active" | "pending" | "inactive";
}): Promise<ActionResult<TeamMember[]>>

// Add team member
addTeamMember(data: {
  email: string;
  role: string;
  permissions?: string[];
}): Promise<ActionResult<TeamMember>>

// Update member role
updateMemberRole(memberId: string, role: string): Promise<ActionResult<TeamMember>>

// Remove team member
removeTeamMember(memberId: string): Promise<ActionResult<void>>
```

#### Invitations

```typescript
// Send team invitation
sendTeamInvitation(data: {
  email: string;
  role: string;
  message?: string;
}): Promise<ActionResult<TeamInvitation>>

// Accept invitation
acceptInvitation(invitationId: string): Promise<ActionResult<TeamMember>>

// Revoke invitation
revokeInvitation(invitationId: string): Promise<ActionResult<void>>

// Get pending invitations
getPendingInvitations(): Promise<ActionResult<TeamInvitation[]>>
```

### Settings Module

#### General Settings

```typescript
// Get general settings
getGeneralSettings(): Promise<ActionResult<GeneralSettings>>

// Update general settings
updateGeneralSettings(data: {
  companyName?: string;
  timezone?: string;
  language?: string;
  dateFormat?: string;
}): Promise<ActionResult<GeneralSettings>>
```

#### Security Settings

```typescript
// Get security settings
getSecuritySettings(): Promise<ActionResult<SecuritySettings>>

// Update security settings
updateSecSettings(data: {
  passwordPolicy?: PasswordPolicy;
  sessionTimeout?: number;
  ipWhitelist?: string[];
}): Promise<ActionResult<SecuritySettings>>

// Enable 2FA
enable2FA(): Promise<ActionResult<TwoFactorSetup>>

// Disable 2FA
disable2FA(code: string): Promise<ActionResult<void>>
```

### Templates Module

#### Template Management

```typescript
// Get templates
getTemplates(filters?: {
  folderId?: string;
  category?: string;
  search?: string;
}): Promise<ActionResult<Template[]>>

// Create template
createTemplate(data: {
  name: string;
  subject: string;
  content: string;
  folderId?: string;
  category?: string;
}): Promise<ActionResult<Template>>

// Update template
updateTemplate(templateId: string, data: Partial<Template>): Promise<ActionResult<Template>>

// Delete template
deleteTemplate(templateId: string): Promise<ActionResult<void>>
```

#### Folder Management

```typescript
// Create folder
createFolder(data: {
  name: string;
  parentId?: string;
  description?: string;
}): Promise<ActionResult<TemplateFolder>>

// Move template
moveTemplate(templateId: string, folderId: string): Promise<ActionResult<Template>>

// Delete folder
deleteFolder(folderId: string, options?: {
  moveTemplatesTo?: string;
}): Promise<ActionResult<void>>
```

### Campaigns Module

#### Campaign Management

```typescript
// Get campaigns
getCampaigns(filters?: {
  status?: "draft" | "active" | "paused" | "completed";
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<ActionResult<PaginatedCampaigns>>

// Create campaign
createCampaign(data: {
  name: string;
  description?: string;
  templateId: string;
  leadListId: string;
  settings: CampaignSettings;
}): Promise<ActionResult<Campaign>>

// Update campaign
updateCampaign(campaignId: string, data: Partial<Campaign>): Promise<ActionResult<Campaign>>

// Delete campaign
deleteCampaign(campaignId: string): Promise<ActionResult<void>>
```

#### Campaign Control

```typescript
// Start campaign
startCampaign(campaignId: string): Promise<ActionResult<Campaign>>

// Pause campaign
pauseCampaign(campaignId: string): Promise<ActionResult<Campaign>>

// Stop campaign
stopCampaign(campaignId: string): Promise<ActionResult<Campaign>>

// Schedule campaign
scheduleCampaign(campaignId: string, startDate: string): Promise<ActionResult<Campaign>>
```

### Domains Module

#### Domain Management

```typescript
// Get domains
getDomains(filters?: {
  status?: "active" | "pending" | "failed";
  verified?: boolean;
}): Promise<ActionResult<Domain[]>>

// Add domain
addDomain(data: {
  domain: string;
  provider?: string;
  settings?: DomainSettings;
}): Promise<ActionResult<Domain>>

// Verify domain
verifyDomain(domainId: string): Promise<ActionResult<DomainVerificationResult>>

// Delete domain
deleteDomain(domainId: string): Promise<ActionResult<void>>
```

#### Email Accounts

```typescript
// Get email accounts
getEmailAccounts(domainId: string): Promise<ActionResult<EmailAccount[]>>

// Create email account
createEmailAccount(data: {
  domainId: string;
  username: string;
  displayName?: string;
  signature?: string;
}): Promise<ActionResult<EmailAccount>>

// Update email account
updateEmailAccount(accountId: string, data: Partial<EmailAccount>): Promise<ActionResult<EmailAccount>>
```

## Response Formats

### Success Response

```typescript
{
  success: true,
  data: {
    // Response data based on action type
  }
}
```

### Error Response

```typescript
{
  success: false,
  error: {
    type: "validation",
    message: "Invalid email address",
    code: "INVALID_EMAIL",
    field: "email",
    details: {
      providedValue: "invalid-email",
      expectedFormat: "user@domain.com"
    }
  }
}
```

### Paginated Response

```typescript
{
  success: true,
  data: {
    items: [...],
    pagination: {
      total: 150,
      limit: 20,
      offset: 0,
      hasMore: true
    }
  }
}
```

## Rate Limiting

### Rate Limit Configuration

Different operations have different rate limits:

```typescript
// Standard limits
const RateLimits = {
  // General operations
  GENERAL_READ: { limit: 1000, window: 60000 }, // 1000/minute
  GENERAL_WRITE: { limit: 100, window: 60000 }, // 100/minute

  // Authentication
  AUTH_LOGIN: { limit: 5, window: 300000 }, // 5/5 minutes
  AUTH_RESET_PASSWORD: { limit: 3, window: 3600000 }, // 3/hour

  // Team operations
  TEAM_INVITE: { limit: 10, window: 3600000 }, // 10/hour
  TEAM_UPDATE: { limit: 50, window: 60000 }, // 50/minute

  // Billing operations
  BILLING_UPDATE: { limit: 10, window: 60000 }, // 10/minute
  PAYMENT_METHOD: { limit: 5, window: 300000 }, // 5/5 minutes

  // Analytics
  ANALYTICS_QUERY: { limit: 200, window: 60000 }, // 200/minute
  ANALYTICS_EXPORT: { limit: 10, window: 3600000 }, // 10/hour

  // Bulk operations
  BULK_OPERATION: { limit: 10, window: 300000 }, // 10/5 minutes

  // Sensitive operations
  SENSITIVE_ACTION: { limit: 5, window: 60000 }, // 5/minute
};
```

### Rate Limit Headers

Rate limit information is included in response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
X-RateLimit-Window: 60000
```

### Rate Limit Exceeded Response

```typescript
{
  success: false,
  error: {
    type: "rate_limit",
    message: "Rate limit exceeded. Try again in 45 seconds.",
    code: "RATE_LIMIT_EXCEEDED",
    details: {
      limit: 100,
      window: 60000,
      resetTime: 1640995200,
      retryAfter: 45
    }
  }
}
```

## Performance Monitoring

### Automatic Monitoring

All actions include automatic performance monitoring:

- **Execution time tracking**
- **Success/failure rate monitoring**
- **Error categorization and logging**
- **ConvexQueryHelper integration**
- **Cache hit rate monitoring**

### Performance Metrics

```typescript
interface PerformanceMetrics {
  actionName: string;
  executionTime: number;
  success: boolean;
  timestamp: number;
  userId?: string;
  companyId?: string;
  cacheHit?: boolean;
  convexQueryTime?: number;
}
```

### Health Check Endpoints

Each module provides health check functions:

```typescript
// Analytics health
getBillingAnalyticsHealth(): Promise<ActionResult<HealthStatus>>
getCampaignAnalyticsHealth(): Promise<ActionResult<HealthStatus>>

// Module health
getBillingModuleHealth(): Promise<ActionResult<HealthStatus>>
getTeamModuleHealth(): Promise<ActionResult<HealthStatus>>
```

### Health Status Format

```typescript
interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: number;
  checks: {
    database: "pass" | "fail";
    convex: "pass" | "fail";
    cache: "pass" | "fail";
    external: "pass" | "fail";
  };
  metrics: {
    responseTime: number;
    errorRate: number;
    throughput: number;
  };
  issues: string[];
}
```

## Usage Examples

### Basic Action Usage

```typescript
import { getBillingInfo } from "@/lib/actions/billing";

const result = await getBillingInfo();

if (result.success) {
  console.log("Billing info:", result.data);
} else {
  console.error(`Error (${result.error.type}): ${result.error.message}`);

  if (result.error.field) {
    console.error(`Field: ${result.error.field}`);
  }
}
```

### Handling Validation Errors

```typescript
import { updateUserProfile } from "@/lib/actions/profile";

const result = await updateUserProfile({
  name: "John Doe",
  email: "invalid-email", // This will cause validation error
});

if (!result.success && result.error.type === "validation") {
  console.error(
    `Validation error in ${result.error.field}: ${result.error.message}`
  );

  // Handle field-specific error
  if (result.error.field === "email") {
    showEmailError(result.error.message);
  }
}
```

### Handling Rate Limits

```typescript
import { sendTeamInvitation } from "@/lib/actions/team";

const result = await sendTeamInvitation({
  email: "user@example.com",
  role: "member",
});

if (!result.success && result.error.type === "rate_limit") {
  const retryAfter = result.error.details?.retryAfter as number;
  console.log(`Rate limited. Retry after ${retryAfter} seconds`);

  // Implement retry logic
  setTimeout(() => {
    // Retry the operation
  }, retryAfter * 1000);
}
```

### Pagination Example

```typescript
import { getCampaigns } from "@/lib/actions/campaigns";

const result = await getCampaigns({
  limit: 20,
  offset: 0,
  status: "active",
});

if (result.success) {
  const { items, pagination } = result.data;

  console.log(`Showing ${items.length} of ${pagination.total} campaigns`);

  if (pagination.hasMore) {
    console.log("More campaigns available");
  }
}
```

## Migration from Legacy APIs

### Before (Legacy)

```typescript
// Old inconsistent pattern
try {
  const billing = await getBillingInfo("user-id");
  if (billing.error) {
    throw new Error(billing.error);
  }
  return billing.data;
} catch (error) {
  console.error(error);
  throw error;
}
```

### After (Standardized)

```typescript
// New consistent pattern
const result = await getBillingInfo();

if (result.success) {
  return result.data;
} else {
  console.error(`${result.error.type}: ${result.error.message}`);
  throw new Error(result.error.message);
}
```

This API documentation provides comprehensive coverage of all action modules and their standardized patterns. For implementation details, refer to the individual module documentation and source code.
