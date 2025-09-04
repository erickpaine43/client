# 📋 Domain Types Documentation

Mini documentation for the consolidated domain types system.

## 🚀 Quick Access

```typescript
import {
  Domain,           // Main flexible interface
  DomainDB,         // Database operations
  DomainMock,       // Mock/development data
  DomainUpdate,     // PATCH operations
  DomainAnalytics,  // Dashboard displays
  EmailAccount      // Account management
} from "@/types";
```

## 🎯 Type Usage Guide

### Domain (Primary)
- **Use for**: Most domain operations, flexible data sources
- **Key feature**: Supports both string and enum statuses

```typescript
interface Domain {
  id: number;
  domain: string;
  status: DomainStatus | string;  // 🎯 Flexibile for mocks
  emailAccounts?: number;         // 📧 Standard field
  mailboxes?: number;            // 📧 Mock compatibility
  spf?: boolean | string;        // 🔐 Flexible DNS status
  dkim?: boolean | string;       // 🔐 Flexible DNS status
  dmarc?: boolean | string;      // 🔐 Flexible DNS status
  // ... more optional fields
}
```

### DomainDB (Database)
- **Use for**: Database reads/writes, guaranteed required fields
- **Required**: `id`, `domain`, `status`, dates, `companyId`, `createdById`

```typescript
// Extends Domain with guaranteed presence of key fields
interface DomainDB extends Domain {
  id: number;           // Guaranteed
  domain: string;       // Guaranteed
  status: DomainStatus; // Enum (no strings)
  createdAt: string;    // Guaranteed
  updatedAt: string;    // Guaranteed
  companyId: number;    // Guaranteed
  createdById: string;  // Guaranteed
}
```

### DomainMock (Development)
- **Use for**: Test data, component development
- **Structure**: Simple, hardcoded values

```typescript
interface DomainMock {
  id: number;
  domain: string;
  status: string;       // "verified", "pending", etc.
  mailboxes: number;    // Simple count
  records: {
    spf: string;       // "verified", "pending", "failed"
    dkim: string;      // "verified", "pending", "failed"
    dmarc: string;     // "verified", "pending", "failed"
    mx: string;        // "verified", "pending", "failed"
  };
  addedDate: string;    // Alternative to createdAt
}
```

### DomainUpdate (PATCH)
- **Use for**: Partial updates to downside complex object changes
- **Type**: Only updates allowed fields

```typescript
type DomainUpdate = Partial<Pick<Domain, Exclude<keyof Domain, 'id' | 'createdAt' | 'updatedAt' | 'companyId' | 'createdById'>>>;
```

## 🔧 Type Utilities

### Union Types
```typescript
type DomainOrMock = Domain | DomainMock;
type DomainOrDB = Domain | DomainDB | DomainMock;
```

### Type Guards
```typescript
// Runtime type checking
export const isDomainMock = (domain: DomainOrMock): domain is DomainMock =>
  'records' in domain && typeof domain.records === 'object';

export const isDomainDB = (domain: DomainOrDB): domain is DomainDB =>
  'companyId' in domain && 'createdById' in domain && typeof domain.createdAt === 'string';
```

## 📋 Enums & Constants

```typescript
// Status types
type DomainStatus = "PENDING" | "VERIFIED" | "SETUP_REQUIRED" | "FAILED" | "DELETED";
type EmailAccountStatus = "PENDING" | "ACTIVE" | "ISSUE" | "SUSPENDED" | "DELETED";
type WarmupStatusType = "NOT_STARTED" | "WARMING" | "WARMED" | "PAUSED";

// Verification
enum VerificationStatus {
  VERIFIED = "VERIFIED",
  PENDING = "PENDING",
  ERROR = "ERROR",
  NOT_CONFIGURED = "NOT_CONFIGURED",
  DISABLED = "DISABLED"
}

// DNS providers
enum DNSProvider {
  CLOUDFLARE = "Cloudflare",
  GODADDY = "GoDaddy",
  NAMECHEAP = "Namecheap",
  // ... more providers
}
```

## 💡 Usage Patterns

### ✅ Recommended Patterns

```typescript
// 1. Flexible domain operations
import { Domain, DomainOrMock } from "@/types";

const handleDomain = (domain: Domain) => {
  // Works with any domain source
  console.log(`${domain.domain}: ${domain.status}`);
};

// 2. Type-safe database operations
import { DomainDB } from "@/types";

const saveDomain = async (domain: DomainDB): Promise<void> => {
  // Required fields are guaranteed
  await db.update(domain.companyId, domain);
};

// 3. Mock data for development
import { DomainMock } from "@/types";

const mockDomain: DomainMock = {
  id: 1,
  domain: "test.example.com",
  status: "verified",
  mailboxes: 25,
  records: {
    spf: "verified",
    dkim: "verified",
    dmarc: "pending",
    mx: "verified"
  },
  addedDate: "2024-01-15T10:30:00Z"
};
```

### ❌ Anti-patterns

```typescript
// ❌ Don't manually check types
if (domain.type === 'mock') { // Use type guards instead

// ❌ Don't access optional fields without guards
domain.emailAccounts!.toString() // Unsafe without null check

// ❌ Don't use direct string statuses in DB contexts
const dbDomain: DomainDB = { status: "verified" } // Use enum values
```

## 🔑 Migration Guide

### Old → New Type Mapping

| Old Path | Old Type | New Type | Notes |
|----------|----------|----------|--------|
| `@/types/domain.ts` | `Domain` | `Domain` | Maintained compatibility |
| `@/types/domain-fixed.ts` | `Domain` | `Domain` | Merged with improvements |
| `@/types/domain-simple.d.ts` | `Domain` | `Domain` | Union types preserved |
| `@/types/domains.ts` | `Domain` | `Domain` | Enhanced with flexibility |

### Import Updates

```typescript
// Before (conflicting)
import { Domain } from '@/types/domain';
import { Domain } from '@/types/domain-fixed';
import { Domain } from '@/types/domains';

// After (unified)
import { Domain, DomainMock, DomainDB } from '@/types';
```

## 📊 Validation Schemas

```typescript
import { addDomainFormSchema, domainSettingsSchema } from "@/types";

// Domain creation validation
const createForm = useForm({
  resolver: zodResolver(addDomainFormSchema)
});

// Domain settings validation
const settingsForm = useForm({
  resolver: zodResolver(domainSettingsSchema)
});
```

## 🏗️ File Organization

```
types/
├── domains.ts        # ⚡ Main consolidated file
├── domain.ts         # 🗑️ Legacy (to be removed)
├── index.ts         # 📦 Central exports
└── DOMAINS_TYPES_DOCS.md # 📋 This documentation
```

## 🎯 Quick Reference

- **DomainMock**: Test/development data
- **DomainDB**: Database operations
- **DomainUpdate**: PATCH operations
- **DomainAnalytics**: UI dashboards
- **Domain**: General purpose (most flexible)
