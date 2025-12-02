# Unified FormField Component

A standardized FormField component that provides consistent styling, validation, and error handling across text inputs, select dropdowns, and checkboxes using the design system.

## 🎯 Overview

The `UnifiedFormField` component consolidates form field implementations into a single, reusable component that:

- Uses design tokens for consistent styling
- Supports multiple field types (text, select, checkbox)
- Includes automatic error state handling
- Integrates seamlessly with React Hook Form
- Provides consistent accessibility patterns

## 📦 Components

### Main Components

- **`UnifiedFormField`** - Generic component that supports all field types
- **`TextFormField`** - Convenience component for text inputs
- **`SelectFormField`** - Convenience component for select dropdowns
- **`CheckboxFormField`** - Convenience component for checkboxes

### Types and Interfaces

- **`FormFieldType`** - Type union: `"text" | "select" | "checkbox"`
- **`BaseFormFieldProps`** - Base props shared by all field types
- **`TextFormFieldProps`** - Props specific to text inputs
- **`SelectFormFieldProps`** - Props specific to select dropdowns
- **`CheckboxFormFieldProps`** - Props specific to checkboxes
- **`SelectFormFieldOption`** - Option interface for select items

## 🚀 Usage Examples

### Basic Text Field

```tsx
import { TextFormField } from "@/components/design-system/components/unified-form-field";

<TextFormField
  name="email"
  control={form.control}
  label="Email Address"
  placeholder="john.doe@example.com"
  inputType="email"
  description="We'll use this for account verification"
  required
/>;
```

### Select Dropdown

```tsx
import { SelectFormField } from "@/components/design-system/components/unified-form-field";

const roleOptions = [
  { value: "user", label: "User" },
  { value: "admin", label: "Administrator" },
  { value: "moderator", label: "Moderator" },
];

<SelectFormField
  name="role"
  control={form.control}
  label="User Role"
  placeholder="Choose a role"
  options={roleOptions}
  description="Select your role in the system"
  required
/>;
```

### Checkbox

```tsx
import { CheckboxFormField } from "@/components/design-system/components/unified-form-field";

<CheckboxFormField
  name="agreeToTerms"
  control={form.control}
  label="I agree to the terms and conditions"
  description="You must agree to our terms before proceeding"
  required
/>;
```

### Unified Component Usage

```tsx
import { UnifiedFormField } from "@/components/design-system/components/unified-form-field";

// Text field
<UnifiedFormField
  name="name"
  control={form.control}
  label="Full Name"
  type="text"
  placeholder="Enter your name"
  required
/>

// Select field
const countryOptions = [
  { value: "us", label: "United States" },
  { value: "ca", label: "Canada" },
  { value: "mx", label: "Mexico" }
];

<UnifiedFormField
  name="country"
  control={form.control}
  label="Country"
  type="select"
  options={countryOptions}
  placeholder="Select a country"
  required
/>

// Checkbox field
<UnifiedFormField
  name="newsletter"
  control={form.control}
  label="Subscribe to newsletter"
  type="checkbox"
  description="Get weekly updates"
/>
```

## 🔧 Props Reference

### Base Props (All Field Types)

| Prop          | Type      | Required | Description                               |
| ------------- | --------- | -------- | ----------------------------------------- |
| `name`        | `string`  | ✅       | Field name for form registration          |
| `control`     | `Control` | ✅       | React Hook Form control object            |
| `label`       | `string`  | ✅       | Field label text                          |
| `description` | `string`  | ❌       | Helper text displayed below field         |
| `placeholder` | `string`  | ❌       | Placeholder text                          |
| `disabled`    | `boolean` | ❌       | Disable the field (default: `false`)      |
| `required`    | `boolean` | ❌       | Mark field as required (default: `false`) |
| `className`   | `string`  | ❌       | Additional CSS classes                    |

### Text Field Props

| Prop            | Type                                                            | Required | Description                         |
| --------------- | --------------------------------------------------------------- | -------- | ----------------------------------- |
| `inputType`     | `"text" \| "email" \| "password" \| "number" \| "tel" \| "url"` | ❌       | HTML input type (default: `"text"`) |
| `onValueChange` | `(value: string) => void`                                       | ❌       | Callback when value changes         |

### Select Field Props

| Prop            | Type                      | Required | Description                 |
| --------------- | ------------------------- | -------- | --------------------------- |
| `options`       | `SelectFormFieldOption[]` | ✅       | Array of select options     |
| `onValueChange` | `(value: string) => void` | ❌       | Callback when value changes |

### Checkbox Field Props

| Prop              | Type                         | Required | Description                         |
| ----------------- | ---------------------------- | -------- | ----------------------------------- |
| `onCheckedChange` | `(checked: boolean) => void` | ❌       | Callback when checked state changes |

## 🎨 Design Tokens

The component uses the following design tokens for styling:

### Colors

- `border-input` - Default border color
- `border-destructive` - Error state border color
- `text-destructive` - Error state text color
- `text-muted-foreground` - Description text color
- `focus-visible:ring-ring/50` - Focus ring color
- `focus-visible:ring-destructive/20` - Error focus ring color

### Spacing

- `space-y-2` - Default spacing between elements
- `ml-1`, `ml-6` - Label and description indentation
- `p-3`, `px-3`, `py-2` - Internal padding

### Typography

- `text-sm font-medium leading-none` - Label typography
- `text-sm` - Description and error text
- `text-muted-foreground` - Description text color

## 🔄 Error Handling

The component automatically handles form validation errors through React Hook Form integration:

### Visual Indicators

- **Border Color**: Red border (`border-destructive`) when field has errors
- **Label Color**: Red label text (`text-destructive`) when field has errors
- **Focus Ring**: Red focus ring (`focus-visible:ring-destructive/20`) when field has errors
- **Error Message**: Red text below field showing validation message

### Accessibility

- `aria-invalid="true"` automatically added to invalid fields
- Error messages linked via `aria-describedby` for screen readers
- Proper focus management for keyboard navigation

```tsx
// Error states are handled automatically through React Hook Form
const {
  formState: { errors },
} = useForm();

<TextFormField
  name="email"
  control={form.control}
  label="Email"
  placeholder="Enter your email"
  required
  // Error styling is automatic when validation fails
/>;
```

## 🔌 React Hook Form Integration

### Setup with React Hook Form

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  TextFormField,
  SelectFormField,
} from "@/components/design-system/components/unified-form-field";

// Define validation schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  role: z.string().min(1, "Please select a role"),
});

// Role options for the form
const roleOptions = [
  { value: "user", label: "User" },
  { value: "admin", label: "Administrator" },
  { value: "moderator", label: "Moderator" },
];

function MyForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
    },
  });

  const onSubmit = (data) => {
    console.log("Form data:", data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <TextFormField
        name="name"
        control={form.control}
        label="Full Name"
        required
      />

      <TextFormField
        name="email"
        control={form.control}
        label="Email"
        inputType="email"
        required
      />

      <SelectFormField
        name="role"
        control={form.control}
        label="Role"
        options={roleOptions}
        required
      />

      <button type="submit">Submit</button>
    </form>
  );
}
```

### Integration with Zod Validation

```tsx
import { z } from "zod";

// Define your schema
const userSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  age: z.number().min(18, "Must be 18 or older"),
  newsletter: z.boolean().default(false),
  country: z.string().min(1, "Please select a country")
});

// Use with form
const form = useForm({
  resolver: zodResolver(userSchema)
});

// Fields work automatically with validation
const countries = [
  { value: "us", label: "United States" },
  { value: "ca", label: "Canada" },
  { value: "mx", label: "Mexico" }
];

<TextFormField name="firstName" control={form.control} label="First Name" required />
<TextFormField name="age" control={form.control} label="Age" inputType="number" required />
<CheckboxFormField name="newsletter" control={form.control} label="Subscribe to newsletter" />
<SelectFormField name="country" control={form.control} options={countries} label="Country" required />
```

## 🎯 Migration from Existing Components

### From Direct UI Components

**Before:**

```tsx
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input placeholder="Enter email" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>;
```

**After:**

```tsx
import { TextFormField } from "@/components/design-system/components/unified-form-field";

<TextFormField
  name="email"
  control={form.control}
  label="Email"
  placeholder="Enter email"
  inputType="email"
/>;
```

### Benefits of Migration

- **Consistency**: All fields use the same design tokens and styling
- **Less Code**: Reduced boilerplate and repetition
- **Better DX**: Simplified prop interface and TypeScript types
- **Error Handling**: Automatic error state management
- **Accessibility**: Built-in ARIA attributes and keyboard navigation

## 🧪 Testing

Example test implementation:

```tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TextFormField } from "@/components/design-system/components/unified-form-field";

describe("TextFormField", () => {
  it("renders label and input", () => {
    const TestWrapper = ({ children }) => {
      const form = useForm();
      return (
        <form>
          {children({ control: form.control, formState: form.formState })}
        </form>
      );
    };

    render(
      <TestWrapper>
        {({ control }) => (
          <TextFormField
            name="test"
            control={control}
            label="Test Label"
            placeholder="Test placeholder"
          />
        )}
      </TestWrapper>
    );

    expect(screen.getByLabelText("Test Label")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Test placeholder")).toBeInTheDocument();
  });

  it("displays error message when field is invalid after submission", async () => {
    const schema = z.object({
      test: z.string().min(1, "Test error"),
    });

    const TestWrapper = () => {
      const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: { test: "" },
      });

      return (
        <form onSubmit={form.handleSubmit(() => {})}>
          <TextFormField
            name="test"
            control={form.control}
            label="Test Label"
          />
          <button type="submit">Submit</button>
        </form>
      );
    };

    render(<TestWrapper />);

    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText("Test error")).toBeInTheDocument();
    });
  });
});
```

## 🔧 Advanced Usage

### Custom Styling

```tsx
<TextFormField
  name="email"
  control={form.control}
  label="Email"
  className="bg-blue-50 border-blue-200"
/>
```

### Event Callbacks

```tsx
<TextFormField
  name="search"
  control={form.control}
  label="Search"
  placeholder="Type to search..."
  onValueChange={(value) => {
    // Handle live search or filtering
    performSearch(value);
  }}
/>

<SelectFormField
  name="category"
  control={form.control}
  label="Category"
  options={categories}
  onValueChange={(value) => {
    // Handle category changes
    filterByCategory(value);
  }}
/>

// Example categories data
const categories = [
  { value: "tech", label: "Technology" },
  { value: "design", label: "Design" },
  { value: "business", label: "Business" }
];
```

### Disabled State

```tsx
<CheckboxFormField
  name="terms"
  control={form.control}
  label="Accept Terms"
  description="You must accept the terms to continue"
  disabled={isSubmitting}
/>
```

## 🎨 Component Architecture

```md
UnifiedFormField
├── TextFormField (convenience wrapper)
├── SelectFormField (convenience wrapper)
├── CheckboxFormField (convenience wrapper)
└── Shared styling and error handling
    ├── Design token integration
    ├── React Hook Form integration
    ├── Accessibility features
    └── Error state management
```

## 📚 Related Components

- **`Form`** - React Hook Form provider wrapper
- **`Button`** - Form submission buttons
- **`Card`** - Container for form sections
- **`Input`** - Base text input component
- **`Select`** - Base select dropdown component
- **`Checkbox`** - Base checkbox component

## ✅ Acceptance Criteria

- ✅ Component uses design tokens
- ✅ Supports text input, select, and checkbox types
- ✅ Includes error state styling
- ✅ Integrates with React Hook Form
- ✅ Provides consistent accessibility
- ✅ Follows design system patterns

## 📝 Notes

- All components are TypeScript-first with comprehensive type definitions
- Error handling is automatic through React Hook Form integration
- The component uses existing UI primitives and doesn't create new styles
- Accessibility features are built-in through Radix UI components
- Design tokens ensure consistency across the application
