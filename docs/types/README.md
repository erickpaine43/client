# TypeScript Type System Organization

## Overview

The project uses a well-organized TypeScript type system that promotes type safety, code reusability, and clear domain boundaries. Types are organized by feature domain and usage patterns.

## Type Organization Structure

```
types/
├── index.ts                 # Central type exports
├── common.ts               # Shared utility types
├── analytics/              # Analytics domain types
│   ├── README.md          # Analytics type organization
│   └── type-limitations.md # Analytics-specific constraints
├── domains/               # Domain management types
│   └── README.md         # Domain type system
├── auth.ts               # Authentication types
├── campaign.ts           # Campaign types
├── conversation.ts       # Conversation types
├── mailbox.ts           # Mailbox types
├── templates.ts         # Template types
└── ui.ts                # UI component types
```

## Type System Principles

### Domain-Driven Types

Types are organized by business domain to maintain clear boundaries and reduce coupling:

```typescript
// Domain-specific type organization
import { CampaignAnalytics } from "./analytics/campaign";
import { DomainAnalytics } from "./analytics/domain";
import { MailboxAnalytics } from "./analytics/mailbox";
```

### Separation of Concerns

Clear separation between different type categories:

- **Data Types**: Database entities and API responses
- **UI Types**: Component props and state interfaces
- **Service Types**: Business logic and service interfaces
- **Utility Types**: Generic helpers and transformations

### Type Safety Patterns

Consistent patterns for type safety:

```typescript
// Branded types for ID safety
type CampaignId = string & { __brand: "CampaignId" };
type DomainId = string & { __brand: "DomainId" };

// Discriminated unions for state management
type LoadingState =
  | { status: "loading" }
  | { status: "success"; data: any }
  | { status: "error"; error: string };
```

## Feature-Specific Type Documentation

### Analytics Types

- [Analytics Type Organization](../../types/analytics/README.md)
- [Analytics Type Limitations](../../types/analytics/type-limitations.md)

### Domain Types

- [Domain Type System](../../types/domains/README.md)

### Core Types

- **Authentication**: `types/auth.ts` - User authentication and authorization
- **Campaigns**: `types/campaign.ts` - Campaign management and execution
- **Conversations**: `types/conversation.ts` - Email conversation threading
- **Mailboxes**: `types/mailbox.ts` - Mailbox configuration and management
- **Templates**: `types/templates.ts` - Email template system

## Common Type Patterns

### API Response Types

Standardized patterns for API responses:

```typescript
// Standard API response wrapper
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// Paginated response pattern
interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  hasMore: boolean;
  nextCursor?: string;
}
```

### Form and Validation Types

Consistent form handling patterns:

```typescript
// Form state management
interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
}

// Validation result types
type ValidationResult<T> =
  | { valid: true; data: T }
  | { valid: false; errors: ValidationError[] };
```

### Component Prop Types

Standardized component interface patterns:

```typescript
// Base component props
interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Data component props
interface DataComponentProps<T> extends BaseComponentProps {
  data: T;
  loading?: boolean;
  error?: string;
  onRefresh?: () => void;
}
```

## Type Safety Best Practices

### Strict Type Checking

The project uses strict TypeScript configuration:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Type Guards and Assertions

Consistent patterns for runtime type checking:

```typescript
// Type guard pattern
function isCampaignAnalytics(obj: any): obj is CampaignAnalytics {
  return obj && typeof obj.campaignId === "string";
}

// Assertion pattern with validation
function assertValidEmail(email: string): asserts email is ValidEmail {
  if (!isValidEmail(email)) {
    throw new Error(`Invalid email format: ${email}`);
  }
}
```

### Generic Type Utilities

Reusable type transformations:

```typescript
// Utility types for common transformations
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// Advanced utility types
type NonNullable<T> = T extends null | undefined ? never : T;
type ExtractArrayType<T> = T extends (infer U)[] ? U : never;
type FunctionReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// Conditional type utilities
type IsString<T> = T extends string ? true : false;
type FilterByType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];
```

## Platform-Specific Considerations

### Convex Type Integration

Special considerations for Convex integration:

```typescript
// Convex document types
import { Doc, Id } from "./_generated/dataModel";

type CampaignDoc = Doc<"campaigns">;
type CampaignId = Id<"campaigns">;

// Convex query/mutation argument types
type CreateCampaignArgs = {
  name: string;
  domainId: Id<"domains">;
  templateId: Id<"templates">;
};
```

### React Component Types

Consistent React component typing:

```typescript
// Component with children
interface ComponentWithChildren {
  children: React.ReactNode;
}

// Event handler types
interface FormHandlers {
  onSubmit: (data: FormData) => void;
  onChange: (field: string, value: any) => void;
  onValidate: (data: FormData) => ValidationResult;
}
```

## Type System Limitations

### Known Constraints

- [Convex Type Limitations](../development/convex-limitations.md#type-system-limitations)
- [Analytics Type Constraints](../../types/analytics/type-limitations.md)
- [Performance Considerations](../development/convex-limitations.md#performance-optimization-patterns)

### Type System Issues

Common type system challenges and their solutions:

#### Deep Type Instantiation

Convex types can become excessively deep, causing TypeScript compilation issues:

```typescript
// Problem: Deep type instantiation
type DeepAnalytics = ComplexAnalyticsType<DeepNested<VeryComplex<T>>>;

// Solution: Type simplification
type SimplifiedAnalytics = Pick<ComplexAnalyticsType, "essential" | "fields">;
```

#### Generic Type Constraints

Working with complex generic constraints:

```typescript
// Utility for constraining generic types
type ConstrainedGeneric<T extends Record<string, any>> = {
  [K in keyof T]: T[K] extends string ? T[K] : string;
};
```

### Workaround Patterns

Common patterns for working around type system limitations:

```typescript
// Type assertion for complex Convex types
// @ts-expect-error - Convex type instantiation is excessively deep
const result = await convexHelper.query(api.analytics.getCampaignStats, args);

// Utility type for simplifying complex types
type SimplifiedAnalytics = Pick<CampaignAnalytics, "id" | "name" | "stats">;
```

## Migration and Evolution

### Type Migration Patterns

- [Type Migration Guide](../../types/analytics/migration-guide.md)
- [Migration Lessons Learned](../../lib/services/analytics/migration-lessons.md#type-migrations)

### Backward Compatibility

Strategies for maintaining backward compatibility during type evolution:

```typescript
// Versioned types for API evolution
interface CampaignV1 {
  id: string;
  name: string;
}

interface CampaignV2 extends CampaignV1 {
  description?: string;
  tags: string[];
}

// Migration utility
function migrateCampaignV1ToV2(v1: CampaignV1): CampaignV2 {
  return {
    ...v1,
    tags: [],
  };
}
```

## Getting Started

1. **Understanding Type Organization**: Review the structure above
2. **Feature-Specific Types**: Start with [Analytics Types](../../types/analytics/README.md)
3. **Common Patterns**: Study the patterns in `types/common.ts`
4. **Platform Integration**: Review [Convex Limitations](../development/convex-limitations.md)

## Contributing to Type System

When adding new types:

1. **Choose the Right Location**: Domain-specific vs. common types
2. **Follow Naming Conventions**: PascalCase for interfaces, camelCase for type aliases
3. **Document Complex Types**: Add JSDoc comments for complex interfaces
4. **Consider Backward Compatibility**: Plan for type evolution
5. **Test Type Safety**: Ensure strict type checking passes

For questions about type organization or patterns, refer to:

- [Development Patterns](../development/README.md#type-patterns)
- [Analytics Type Patterns](../../types/analytics/README.md)
- [Convex Integration Patterns](../development/convex-limitations.md)
