# Billing API Endpoints - Security Boundaries Implementation

This document describes the secure billing API endpoints implemented as part of task 7.1.2 "Establish Billing Security Boundaries". These endpoints provide secure CRUD operations for billing data following OLTP-first patterns with proper authentication and PCI compliance.

## Security Features

### 🔒 Authentication & Authorization

- **NileDB Authentication Required**: All endpoints require valid NileDB authentication
- **Tenant Isolation**: Database-level tenant isolation using Row-Level Security (RLS)
- **User Context Validation**: Company ID derived from authenticated user context
- **Audit Trail**: All operations logged with user attribution

### 💳 Payment Security (PCI Compliance)

- **Payment Method Tokenization**: Only tokenized payment method IDs stored
- **Last 4 Digits Only**: No full card numbers in database or API responses
- **Sensitive Data Exclusion**: Provider payment method IDs and internal audit fields excluded from responses
- **Secure Processing**: Payment processing delegated to PCI-compliant providers (Stripe)

### 🏛️ Financial Data Protection

- **OLTP Isolation**: All sensitive financial data stays in NileDB
- **Zero Analytics Exposure**: No financial details exposed in Convex
- **Encrypted Storage**: Billing addresses and sensitive data encrypted
- **Complete Audit Trail**: Financial transaction history with compliance logging

## API Endpoints

### Company Billing

#### `GET /api/billing`

Get company billing information for the authenticated user's company.

**Security**: Requires NileDB authentication, tenant isolation enforced.

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "123",
    "companyId": 456,
    "billingEmail": "billing@company.com",
    "billingAddress": {
      "street": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "zipCode": "94105",
      "country": "US"
    },
    "planId": "professional",
    "billingCycle": "monthly",
    "subscriptionStatus": "active",
    "nextBillingDate": "2024-02-01T00:00:00Z",
    "currency": "USD"
  }
}
```

#### `POST /api/billing`

Create a new company billing account.

**Security**: Requires NileDB authentication, input validation, prevents duplicate accounts.

**Request**:

```json
{
  "billingEmail": "billing@company.com",
  "billingAddress": {
    "street": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94105",
    "country": "US"
  },
  "planId": "professional",
  "billingCycle": "monthly"
}
```

#### `PUT /api/billing`

Update company billing information.

**Security**: Requires NileDB authentication, validates ownership, partial updates supported.

### Payment Methods

#### `GET /api/billing/payment-methods`

Get all active payment methods for the company.

**Security**: Only safe payment method data exposed (last 4 digits, expiry, brand).

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "pm_123",
      "type": "credit_card",
      "provider": "stripe",
      "lastFourDigits": "4242",
      "expiryMonth": 12,
      "expiryYear": 2025,
      "cardBrand": "visa",
      "isDefault": true,
      "isActive": true
    }
  ]
}
```

#### `POST /api/billing/payment-methods`

Add a new payment method.

**Security**: Payment data tokenized before storage, sensitive fields excluded from response.

**Request**:

```json
{
  "type": "credit_card",
  "cardNumber": "4242424242424242",
  "expiryMonth": 12,
  "expiryYear": 2025,
  "cvv": "123",
  "isDefault": true
}
```

#### `PUT /api/billing/payment-methods/{id}`

Update payment method (currently supports setting as default).

**Request**:

```json
{
  "action": "set_default"
}
```

#### `DELETE /api/billing/payment-methods/{id}`

Remove (deactivate) a payment method.

**Security**: Soft deletion, prevents removal of last payment method.

### Invoices

#### `GET /api/billing/invoices`

Get company invoices with pagination.

**Query Parameters**:

- `limit`: Number of invoices to return (max 100)
- `offset`: Pagination offset
- `status`: Filter by invoice status

#### `POST /api/billing/invoices`

Generate a new invoice (usage-based).

**Request**:

```json
{
  "periodStart": "2024-01-01T00:00:00Z",
  "periodEnd": "2024-01-31T23:59:59Z",
  "invoiceType": "usage"
}
```

### Subscription Plans

#### `GET /api/billing/subscription-plans`

Get available subscription plans.

**Query Parameters**:

- `include_inactive`: Include inactive plans (default: false)
- `public_only`: Only public plans (default: true)

#### `GET /api/billing/subscription-plans/{id}`

Get specific subscription plan details.

### Billing Summary

#### `GET /api/billing/summary`

Get comprehensive billing summary for dashboard.

**Security**: Aggregates data from multiple sources, excludes sensitive internal fields.

**Response**:

```json
{
  "success": true,
  "data": {
    "companyBilling": {
      /* billing info */
    },
    "currentPlan": {
      /* plan details */
    },
    "nextInvoice": {
      /* upcoming invoice */
    },
    "paymentMethods": [
      /* safe payment method data */
    ],
    "recentInvoices": [
      /* recent invoices */
    ],
    "usageSummary": {
      "emailsSent": 1250,
      "domainsUsed": 3,
      "mailboxesUsed": 5,
      "storageUsed": 2.5,
      "usersCount": 2
    }
  }
}
```

#### `GET /api/billing/summary/limits`

Check plan limits and usage overages.

**Response**:

```json
{
  "success": true,
  "data": {
    "withinLimits": true,
    "usage": {
      /* current usage */
    },
    "limits": {
      /* plan limits */
    },
    "overages": {
      /* overage amounts */
    }
  }
}
```

### Subscription Management

#### `PUT /api/billing/subscription`

Update subscription plan.

**Security**: Requires NileDB authentication, validates plan availability and company eligibility.

**Request**:

```json
{
  "planId": "professional"
}
```

#### `DELETE /api/billing/subscription`

Cancel subscription.

**Request**:

```json
{
  "reason": "No longer needed"
}
```

#### `POST /api/billing/subscription/reactivate`

Reactivate cancelled subscription.

**Security**: Requires valid payment method to reactivate.

### Usage Tracking

#### `GET /api/billing/usage`

Get current usage summary for billing period.

**Security**: Aggregates usage data from multiple sources, tenant isolation enforced.

**Response**:

```json
{
  "success": true,
  "data": {
    "companyId": 123,
    "periodStart": "2024-01-01T00:00:00Z",
    "periodEnd": "2024-01-31T23:59:59Z",
    "emailsSent": 1250,
    "domainsUsed": 3,
    "mailboxesUsed": 5,
    "storageUsed": 2.5,
    "usersCount": 2
  }
}
```

### Billing Settings

#### `GET /api/billing/settings`

Get billing data formatted for settings page.

**Security**: Comprehensive billing data aggregation with proper field sanitization.

**Response**:

```json
{
  "success": true,
  "data": {
    "renewalDate": "2024-02-01",
    "planDetails": {
      "id": "professional",
      "name": "Professional Plan",
      "price": 2999,
      "features": ["feature1", "feature2"],
      "isMonthly": true,
      "maxEmailAccounts": 10,
      "maxCampaigns": 100
    },
    "paymentMethod": {
      "brand": "visa",
      "lastFour": "4242",
      "expiry": "12/25"
    },
    "billingHistory": [],
    "emailAccountsUsed": 5,
    "campaignsUsed": 25
  }
}
```

#### `PUT /api/billing/settings`

Update billing information (address, etc.).

**Request**:

```json
{
  "billingAddress": {
    "street": "123 New Street",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94105",
    "country": "US"
  }
}
```

## Error Handling

### Standard Error Response

```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

- `AUTH_REQUIRED`: Authentication required (401)
- `COMPANY_ID_REQUIRED`: Company ID missing (400)
- `VALIDATION_ERROR`: Input validation failed (400)
- `BILLING_NOT_FOUND`: Billing account not found (404)
- `PAYMENT_METHOD_NOT_FOUND`: Payment method not found (404)
- `PLAN_NOT_FOUND`: Subscription plan not found (404)
- `PLAN_ID_REQUIRED`: Plan ID missing for subscription update (400)
- `INVALID_ADDRESS_FORMAT`: Billing address format validation failed (400)
- `LAST_PAYMENT_METHOD`: Cannot remove last payment method (409)
- `BILLING_EXISTS`: Billing account already exists (409)
- `INTERNAL_ERROR`: Internal server error (500)

## Security Compliance

### PCI Compliance Measures

1. **Tokenization**: All payment methods tokenized via payment processors
2. **Minimal Data Storage**: Only last 4 digits and safe metadata stored
3. **Secure Processing**: Full payment processing delegated to PCI-compliant providers
4. **No Sensitive Exposure**: Zero sensitive payment data in API responses

### Financial Security

1. **OLTP Isolation**: Complete separation of financial and analytical data
2. **Encryption**: Billing addresses and sensitive data encrypted at rest
3. **Access Control**: Role-based access to financial operations
4. **Audit Logging**: All financial operations logged with user attribution

### Data Protection

1. **Tenant Isolation**: Database-level tenant isolation with RLS policies
2. **Input Validation**: Comprehensive input validation using Zod schemas
3. **Output Sanitization**: Sensitive fields excluded from API responses
4. **Error Handling**: Secure error handling without information leakage

## Implementation Status

### ✅ Completed Features

- **Secure API Endpoints**: All CRUD operations with proper authentication
  - Company billing management (GET, POST, PUT)
  - Payment method management (GET, POST, PUT, DELETE)
  - Invoice operations (GET, POST)
  - Subscription plan access (GET)
  - Subscription management (PUT, DELETE, POST reactivate)
  - Usage tracking (GET)
  - Billing settings (GET, PUT)
  - Comprehensive billing summary (GET)
  - Plan limits monitoring (GET)

- **Payment Method Security**: Tokenization and safe data exposure
- **Financial Data Protection**: Complete OLTP isolation and encryption
- **Audit Trail**: Comprehensive logging for compliance
- **Input Validation**: Zod schema validation for all endpoints
- **Error Handling**: Secure error responses with proper status codes
- **Comprehensive Coverage**: 15+ secure API endpoints covering all billing operations

### 🔒 Security Boundaries Established

- **Zero Sensitive Data Exposure**: No payment details, internal IDs, or audit fields in responses
- **Complete Authentication**: NileDB authentication required for all operations
- **Tenant Isolation**: Database-level security with RLS policies
- **PCI Compliance Foundation**: Tokenization and secure payment processing
- **Financial Security**: Complete separation of financial and analytical data
- **Audit Compliance**: Full audit trail for all financial operations

### 📋 API Endpoint Summary

| Endpoint                               | Method           | Purpose                       | Security Level |
| -------------------------------------- | ---------------- | ----------------------------- | -------------- |
| `/api/billing`                         | GET, POST, PUT   | Company billing management    | 🔒 High        |
| `/api/billing/payment-methods`         | GET, POST        | Payment method management     | 🔒 High        |
| `/api/billing/payment-methods/[id]`    | GET, PUT, DELETE | Individual payment method ops | 🔒 High        |
| `/api/billing/invoices`                | GET, POST        | Invoice operations            | 🔒 High        |
| `/api/billing/subscription-plans`      | GET              | Plan catalog access           | 🔓 Medium      |
| `/api/billing/subscription-plans/[id]` | GET              | Individual plan details       | 🔓 Medium      |
| `/api/billing/subscription`            | PUT, DELETE      | Subscription management       | 🔒 High        |
| `/api/billing/subscription/reactivate` | POST             | Subscription reactivation     | 🔒 High        |
| `/api/billing/usage`                   | GET              | Usage tracking                | 🔒 High        |
| `/api/billing/settings`                | GET, PUT         | Billing settings management   | 🔒 High        |
| `/api/billing/summary`                 | GET              | Comprehensive billing summary | 🔒 High        |
| `/api/billing/summary/limits`          | GET              | Plan limits monitoring        | 🔒 High        |

This implementation successfully establishes the billing security boundaries required by task 7.1.2, providing a secure, compliant, and scalable foundation for billing operations while maintaining the OLTP-first architectural patterns established in task 7.1.1.
