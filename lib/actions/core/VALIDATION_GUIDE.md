# Action Validation System Guide

This guide explains how to implement consistent validation patterns across all action modules using the standardized validation system.

## Overview

The validation system provides:

- **Standardized input validation** across all action modules
- **Reusable validation functions** for common patterns
- **Field-specific error information** with error codes
- **Runtime type checking** where compile-time checking is insufficient
- **Middleware-based validation** for clean separation of concerns

## Core Components

### 1. Validation Functions (`validation.ts`)

Basic validation functions for common data and patterns.

### 2. Validation Schemas (`validation-schemas.ts`)

Pre-defined schemas for common data structures used across analytics actions.

### 3. Validation Middleware (`validation-middleware.ts`)

Middleware functions that can be easily applied to action functions.

## Quick Start

### Basic Schema Validation

```typescript
import { withValidation } from "../core/validation-middleware";
import { campaignAnalyticsSchema } from "../core/validation-schemas";

export const updateCampaign = withValidation(
  campaignAnalyticsSchema,
  async (data: CampaignAnalytics, context?: ActionContext) => {
    // Your business logic here - data is already validated
    return createActionResult(data);
  }
);
```

### Analytics Filters Validation

```typescript
import { withAnalyticsFiltersValidation } from "../core/validation-middleware";

export const getCampaignAnalytics = withAnalyticsFiltersValidation(
  async (filters: AnalyticsFilters | undefined, context?: ActionContext) => {
    // filters are validated and type-safe
    return createActionResult(analyticsData);
  },
  { required: false, allowEmpty: true }
);
```

### ID Validation

```typescript
import { withIdValidation } from "../core/validation-middleware";

export const getCampaignById = withIdValidation(
  async (campaignId: string, context?: ActionContext) => {
    // campaignId is validated
    return createActionResult(campaign);
  },
  {
    fieldName: "campaignId",
    format: "custom",
    pattern: /^camp_[a-zA-Z0-9_-]+$/,
    required: true,
  }
);
```

## Validation Patterns

### 1. Required Field Validation

```typescript
import { validateRequired } from "../core/validation";

const error = validateRequired(value, "fieldName");
if (error) {
  return ErrorFactory.validation(error.message, error.field, error.code);
}
```

### 2. String Validation with Constraints

```typescript
import { validateString } from "../core/validation";

const error = validateString(value, "fieldName", {
  minLength: 3,
  maxLength: 100,
  pattern: /^[a-zA-Z0-9\s\-_]+$/,
  enum: ["ACTIVE", "PAUSED", "COMPLETED"],
});
```

### 3. Number Validation with Constraints

```typescript
import { validateNumber } from "../core/validation";

const error = validateNumber(value, "fieldName", {
  min: 0,
  max: 100,
  integer: true,
});
```

### 4. Array Validation

```typescript
import { validateArray } from "../core/validation";

const errors = validateArray(value, "fieldName", {
  minLength: 1,
  maxLength: 100,
  itemValidator: (item, index) =>
    validateString(item, `item[${index}]`, { minLength: 1 }),
});
```

### 5. Email Validation

```typescript
import { validateEmail } from "../core/validation";

const error = validateEmail(value, "email");
```

### 6. Date Validation

```typescript
import { validateDate } from "../core/validation";

const error = validateDate(value, "dateField", {
  min: new Date("2020-01-01"),
  max: new Date(),
  format: "iso",
});
```

## Schema-Based Validation

### Creating Custom Schemas

```typescript
import { ValidationSchema } from "../core/validation";

const myCustomSchema: ValidationSchema<MyDataType> = {
  id: {
    required: true,
    type: "string",
    min: 1,
    pattern: /^[a-zA-Z0-9_-]+$/,
  },
  name: {
    required: true,
    type: "string",
    min: 3,
    max: 100,
  },
  count: {
    required: false,
    type: "number",
    min: 0,
    integer: true,
  },
  status: {
    required: true,
    type: "string",
    enum: ["ACTIVE", "INACTIVE"] as const,
  },
  metadata: {
    required: false,
    type: "object",
    custom: (value) => {
      // Custom validation logic
      if (value && typeof value === "object") {
        const obj = value as Record<string, unknown>;
        if (obj.priority && typeof obj.priority !== "number") {
          return "Priority must be a number";
        }
      }
      return null;
    },
  },
};
```

### Using Schemas with Validation

```typescript
import { validateSchema, validationToActionResult } from "../core/validation";

export async function updateData(
  data: unknown
): Promise<ActionResult<MyDataType>> {
  const validationResult = validateSchema(data, myCustomSchema);
  if (!validationResult.isValid) {
    return validationToActionResult(validationResult);
  }

  // Use validated data
  const validatedData = validationResult.data!;
  // ... business logic
}
```

## Middleware Patterns

### 1. Single Validation Middleware

```typescript
export const myAction = withValidation(
  mySchema,
  async (data: MyDataType, context?: ActionContext) => {
    // Business logic with validated data
    return createActionResult(result);
  }
);
```

### 2. Bulk Operations Validation

```typescript
export const bulkUpdate = withBulkOperationValidation(
  itemSchema,
  async (items: MyDataType[], context?: ActionContext) => {
    // Process validated items
    return createActionResult(results);
  },
  { maxItems: 50, minItems: 1 }
);
```

### 3. Runtime Type Checking

```typescript
export const processExternalData = withRuntimeTypeCheck(
  isMyDataType, // Type guard function
  async (data: MyDataType, context?: ActionContext) => {
    // Process type-checked data
    return createActionResult(result);
  },
  "Invalid data format provided"
);
```

## Error Handling

### Field-Specific Errors

The validation system provides detailed error information:

```typescript
{
  field: 'campaignName',
  message: 'Campaign name must be at least 3 characters',
  code: 'MIN_LENGTH',
  value: 'ab'
}
```

### Error Codes

Common error codes include:

- `REQUIRED_FIELD` - Field is required but missing
- `INVALID_TYPE` - Value is not of expected type
- `MIN_LENGTH` / `MAX_LENGTH` - String length constraints
- `MIN_VALUE` / `MAX_VALUE` - Number value constraints
- `INVALID_FORMAT` - Pattern/format validation failed
- `INVALID_ENUM` - Value not in allowed enum values
- `CUSTOM_VALIDATION` - Custom validation rule failed

### Converting Validation Results to Action Results

```typescript
import { validationToActionResult } from "../core/validation";

const validationResult = validateSchema(data, schema);
if (!validationResult.isValid) {
  return validationToActionResult(validationResult);
}
```

## Runtime Type Checking

For data from external sources or when compile-time checking is insufficient:

### Type Guards

```typescript
import { isAnalyticsFilters, isPerformanceMetrics } from "../core/validation";

if (isAnalyticsFilters(data)) {
  // data is now typed as AnalyticsFilters
  console.log(data.dateRange?.start);
}
```

### Assertions

```typescript
import { assertType } from "../core/validation";

try {
  assertType(data, isAnalyticsFilters, "Invalid analytics filters");
  // data is now typed as AnalyticsFilters
} catch (error) {
  return ErrorFactory.validation(error.message);
}
```

## Best Practices

### 1. Use Middleware for Consistent Patterns

```typescript
// Good: Use middleware for consistent validation
export const myAction = withValidation(schema, handler);

// Avoid: Manual validation in each function
export async function myAction(data: unknown) {
  if (!data || typeof data !== "object") {
    return ErrorFactory.validation("Invalid data");
  }
  // ... more validation code
}
```

### 2. Validate Early and Fail Fast

```typescript
export async function updateCampaign(
  campaignId: string,
  data: Partial<CampaignAnalytics>
): Promise<ActionResult<CampaignAnalytics>> {
  // Validate ID first
  const idError = validateId(campaignId, "campaignId");
  if (idError) {
    return ErrorFactory.validation(
      idError.message,
      idError.field,
      idError.code
    );
  }

  // Then validate data
  const validationResult = validateSchema(data, campaignAnalyticsSchema);
  if (!validationResult.isValid) {
    return validationToActionResult(validationResult);
  }

  // Continue with business logic
  // ...
}
```

### 3. Provide Meaningful Error Messages

```typescript
const customSchema: ValidationSchema = {
  email: {
    required: true,
    type: "email",
    custom: (value) => {
      if (typeof value === "string" && value.endsWith("@example.com")) {
        return "Please use a real email address, not example.com";
      }
      return null;
    },
  },
};
```

### 4. Use Common Validators for Consistency

```typescript
import { commonValidators } from "../core/validation-middleware";

// Use common validators instead of custom validation
const filtersValidation = commonValidators.analyticsFilters(filters);
const paginationValidation = commonValidators.pagination(pagination);
```

### 5. Combine Validations for Complex Scenarios

```typescript
import { combineValidators } from "../core/validation-middleware";

const compositeValidator = combineValidators([
  commonValidators.analyticsFilters,
  commonValidators.pagination,
  customBusinessRuleValidator,
]);

const result = compositeValidator(data);
```

## Migration Guide

### Updating Existing Actions

1. **Add validation imports:**

```typescript
import {
  validateId,
  validateAnalyticsFilters,
  validateSchema,
} from "../core/validation";
import { myDataSchema } from "../core/validation-schemas";
```

2. **Add validation before business logic:**

```typescript
export async function myAction(data: unknown): Promise<ActionResult<MyData>> {
  // Add validation
  const validationResult = validateSchema(data, myDataSchema);
  if (!validationResult.isValid) {
    return validationToActionResult(validationResult);
  }

  // Existing business logic with validated data
  const validatedData = validationResult.data!;
  // ...
}
```

3. **Or use middleware approach:**

```typescript
export const myAction = withValidation(
  myDataSchema,
  async (data: MyData, context?: ActionContext) => {
    // Move existing business logic here
    // ...
  }
);
```

### Creating New Actions

1. **Start with middleware:**

```typescript
export const newAction = withValidation(
  appropriateSchema,
  async (data: DataType, context?: ActionContext) => {
    // Business logic
    return createActionResult(result);
  }
);
```

2. **Add specific validations as needed:**

```typescript
export const complexAction = withAnalyticsFiltersValidation(
  async (filters: AnalyticsFilters | undefined, context?: ActionContext) => {
    // Additional validation if needed
    if (filters?.entityIds && filters.entityIds.length > 100) {
      return ErrorFactory.validation("Too many entities selected");
    }

    // Business logic
    return createActionResult(result);
  }
);
```

## Testing Validation

### Unit Tests for Validation Functions

```typescript
import { validateString, validateNumber } from "../core/validation";

describe("validateString", () => {
  it("should validate required string", () => {
    const error = validateString("", "name");
    expect(error).toBeNull();
  });

  it("should fail for non-string", () => {
    const error = validateString(123, "name");
    expect(error?.code).toBe("INVALID_TYPE");
  });

  it("should validate min length", () => {
    const error = validateString("ab", "name", { minLength: 3 });
    expect(error?.code).toBe("MIN_LENGTH");
  });
});
```

### Integration Tests for Actions

```typescript
import { getCampaignAnalytics } from "./campaign-analytics";

describe("getCampaignAnalytics", () => {
  it("should validate analytics filters", async () => {
    const result = await getCampaignAnalytics({
      dateRange: {
        start: "invalid-date",
        end: "2023-12-31",
      },
    });

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe("validation");
    expect(result.error?.field).toBe("dateRange.start");
  });
});
```

## Performance Considerations

1. **Validation Order**: Validate cheap operations first (type checks) before expensive ones (database lookups)
2. **Caching**: Cache compiled regex patterns and validation schemas
3. **Early Exit**: Use early returns to avoid unnecessary validation steps
4. **Batch Validation**: For bulk operations, validate in batches to avoid memory issues

## Conclusion

The validation system provides a consistent, type-safe way to validate input across all action modules. By using the provided middleware and schemas, you can ensure that your actions have robust validation with minimal boilerplate code.

For more examples, see `validation-example.ts` which demonstrates all the patterns described in this guide.
