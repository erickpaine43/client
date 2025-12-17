# Centralized Type System Documentation

This document provides guidelines and documentation for the new centralized TypeScript type organization structure implemented across the PenguinMails client application.

## Overview

The application has adopted a centralized type system to improve code maintainability, eliminate duplication, and ensure type consistency across all components and modules. All TypeScript types are now organized in the `/types/` directory with a barrel export structure.

## Directory Structure

```
types/
├── index.ts          # Barrel exports for all types (main entry point)
├── common.ts         # Shared utility types and generic interfaces
├── campaign.ts       # Campaign-related types, forms, and component props
├── domain.d.ts       # Domain and DNS types
├── mailbox.d.ts      # Mailbox and email account types
├── templates.d.ts    # Template and email composition types
├── conversation.d.ts # Conversation and inbox types
├── auth.ts           # Authentication and user types
├── settings.ts       # Settings and configuration types
├── clients-leads.ts  # Client and lead management types
├── nav-link.ts       # Navigation and routing types
├── notification.ts   # Notification types
├── ui.ts             # UI component prop interfaces
├── forms.ts          # Form validation schemas and inferred types
├── analytics.d.ts    # Analytics and reporting types
└── tab.d.ts          # Tab-related types
```

## Type Organization Principles

### 1. Barrel Exports (`index.ts`)

- **Purpose**: Provides a single entry point for importing all types
- **Path Mapping**: Configured in `tsconfig.json` as `"@types/*": ["./types/*.ts"]`
- **Usage**: Allows clean imports like `import { Campaign, CampaignStatus } from '@types/campaign'`

### 2. Common Types (`common.ts`)

- Contains universal utility types used across multiple domains
- Includes base interfaces like `BaseEntity`, `ApiResponse`, `PaginatedResponse`
- Provides common types like `ID`, `Timestamp`, `Status`

### 3. Domain-Specific Files

Each domain has its own type file containing:

- **Core Domain Types**: Main interfaces for the domain (e.g., `Campaign`, `Domain`)
- **Status Enums**: Predefined values for status fields
- **Form Schemas**: Zod validation schemas with inferred TypeScript types
- **Component Props**: Prop interfaces for React components in that domain
- **Action Types**: Constants and enums for domain-specific actions

### 4. File Naming Conventions

- `.ts` for new files with TypeScript interfaces
- `.d.ts` for declaration files and existing type-only files
- PascalCase for type names (e.g., `CampaignFormValues`)
- camelCase for file names (e.g., `campaign.ts`)

## Import Guidelines

### Primary Import Method (Recommended)

Use the barrel exports through path mapping:

```typescript
// Recommended - Clean and centralized
import { Campaign, CampaignStatus, CampaignMetrics } from "@types/campaign";
import { ID, ApiResponse } from "@types/common";
import { Template } from "@types/templates";
```

### Alternative Import Methods

#### Direct File Import (Not Recommended)

```typescript
// Not recommended - Bypasses barrel exports
import { Campaign } from "../../../types/campaign";
```

#### Selective Import by File

```typescript
// Only when needed for specific imports
import { Campaign } from "@types/campaign";
import type { Template } from "./types/templates"; // For type-only imports
```

### Import Best Practices

1. **Use Type-Only Imports** for large type definitions:

```typescript
import type { CampaignFormValues } from "@types/campaign";
```

2. **Group Imports** by source:

```typescript
// Group by source for better organization
import { Campaign, CampaignStatus } from "@types/campaign";
import { User, AuthContext } from "@types/auth";
import { BaseEntity, ApiResponse } from "@types/common";
import { ButtonProps, FormProps } from "@types/ui";
```

3. **Avoid Namespace Imports** for types:

```typescript
// Avoid - Not specific enough
import * as Types from "@types/campaign";

// Prefer - Specific and clear
import { Campaign, CampaignStatus } from "@types/campaign";
```

## Type Usage Patterns

### 1. Core Domain Types

Main interfaces that define the domain entities:

```typescript
// Using core campaign types
import { Campaign, CampaignStatus, CampaignMetrics } from "@types/campaign";

const campaign: Campaign = {
  id: "campaign-1",
  name: "Q4 Sales Promotion",
  status: CampaignStatus.ACTIVE,
  fromName: "Sales Team",
  fromEmail: "sales@company.com",
  metrics: {
    recipients: { sent: 150, total: 200 },
    opens: { total: 45, rate: 0.3 },
    clicks: { total: 12, rate: 0.08 },
    replies: { total: 3, rate: 0.02 },
  },
  lastUpdated: "2024-09-01T10:30:00Z",
};
```

### 2. Form Validation with Zod Schemas

Using centralized form schemas for validation:

```typescript
import { campaignFormSchema, CampaignFormValues } from "@types/campaign";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

function CampaignForm() {
  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      name: "",
      fromName: "",
      fromEmail: "",
      status: CampaignStatus.DRAFT,
      steps: [],
    },
  });

  // Form implementation...
}
```

### 3. Component Props Interfaces

Using centralized props for type-safe React components:

```typescript
import { CampaignFormProps } from "@types/campaign";
import React from "react";

const CampaignFormComponent: React.FC<CampaignFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Create Campaign",
  submitLoadingLabel = "Creating...",
  readOnly = false,
}) => {
  // Component implementation...
};
```

### 4. Common Utility Types

Leveraging shared types for consistency:

```typescript
import { BaseEntity, ApiResponse, PaginatedResponse, ID } from '@types/common'

// Using BaseEntity for consistent shape
interface CustomEntity extends BaseEntity {
  name: string
  description: string
}

// API response structures
const response: ApiResponse<CustomEntity[]> = {
  success: true,
  data: [...],
  message: 'Entities retrieved successfully'
}

// Paginated responses
const paginatedData: PaginatedResponse<CustomEntity> = {
  data: [...],
  total: 150,
  page: 1,
  limit: 10,
  hasMore: true
}
```

### 5. Status and Enum Types

Using predefined constants and enums:

```typescript
import { CampaignStatus, CampaignEventCondition } from "@types/campaign";

// Using enum constants
const getStatusColor = (status: CampaignStatus) => {
  switch (status) {
    case CampaignStatus.ACTIVE:
      return "green";
    case CampaignStatus.PAUSED:
      return "yellow";
    case CampaignStatus.DRAFT:
      return "gray";
    default:
      return "red";
  }
};

// Using condition enums in logic
const shouldSendEmail = (
  condition: CampaignEventCondition,
  eventHistory: any,
) => {
  switch (condition) {
    case CampaignEventCondition.ALWAYS:
      return true;
    case CampaignEventCondition.IF_NOT_OPENED:
      return !eventHistory.opened;
    // ... other conditions
  }
};
```

### 6. Analytics and Metrics Types

Type-safe data structures for reporting:

```typescript
import { MetricData, ChartData } from "@types/campaign";

const processMetrics = (metrics: CampaignMetrics): MetricData[] => {
  return [
    {
      total: metrics.recipients.sent,
      rate: metrics.recipients.sent / metrics.recipients.total,
      trend: "up", // calculated trend
    },
    {
      total: metrics.opens.total,
      rate: metrics.opens.rate,
      trend: "stable",
    },
  ];
};

const chartData: ChartData[] = [
  {
    date: "2024-09-01",
    sent: 150,
    opened: 45,
    replied: 3,
    bounced: 2,
    clicked: 12,
    formattedDate: "Sep 1",
  },
];
```

## Best Practices

### 1. Type Definition Guidelines

- Use `interface` for objects that may be extended
- Use `type` for unions, primitives, and complex types
- Export all types at module level
- Use consistent naming conventions

### 2. Schema Organization

- Place Zod schemas near the types they validate
- Export inferred types using `z.infer<typeof schema>`
- Keep schemas in the same file as related types

### 3. Component Props

- Define props interfaces in domain-specific type files
- Use `ComponentBaseProps` for common props
- Make optional props truly optional with `?`

### 4. Error Handling

- Use `ApiResponse` for API call results
- Include error states in status enums
- Provide descriptive error messages

### 5. Constant Usage

- Use const assertions for enum-like objects
- Export both type and value versions of enums
- Use descriptive names for constants

## Migration Notes

This centralized system replaces scattered type definitions found in:

- Component files (`components/campaigns/types.tsx`)
- Individual modules (`app/dashboard/inbox/schemas/`)
- Inline interface definitions

All existing imports should be updated to use the centralized types through the barrel exports.

## Benefits of Centralization

1. **Single Source of Truth**: All types are defined in one location
2. **Improved Maintainability**: Changes to types propagate automatically
3. **Better Developer Experience**: Path mapping provides clean imports
4. **Type Safety**: Consistent usage across the entire application
5. **Reduced Duplication**: Eliminates duplicate type definitions
6. **Easier Refactoring**: Centralized types make changes safer and easier

## Requirements Reference

This implementation addresses the following requirements from the type centralization plan:

- **1.1**: Enhanced type infrastructure with barrel exports and path mapping
- **3.2**: Centralized conversation and inbox types with comprehensive interfaces
- **4.2**: Domain-specific component props moved to appropriate type files

For questions or clarifications about the type system, please refer to this documentation or consult with the development team.
