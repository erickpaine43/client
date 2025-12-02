"use client";

import * as React from "react";
import {
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
  FormField,
} from "@/components/ui/form";

/**
 * FormField Types
 */
export type FormFieldType = "text" | "select" | "checkbox";

export interface BaseFormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName;
  control: ControllerProps<TFieldValues, TName>["control"];
  label: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export interface TextFormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  inputType?: "text" | "email" | "password" | "number" | "tel" | "url";
  onValueChange?: (value: string) => void;
}

export interface SelectFormFieldOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectFormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  options: SelectFormFieldOption[];
  onValueChange?: (value: string) => void;
}

export interface CheckboxFormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  onCheckedChange?: (checked: boolean) => void;
}

/**
 * Unified FormField Component
 * Supports text input, select dropdown, and checkbox types
 * with consistent styling and error handling
 */
export function UnifiedFormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  label,
  description,
  placeholder,
  disabled = false,
  required = false,
  className,
  type = "text",
  options,
  inputType = "text",
  onValueChange,
  onCheckedChange,
}: BaseFormFieldProps<TFieldValues, TName> & {
  type?: FormFieldType;
  options?: SelectFormFieldOption[];
  inputType?: "text" | "email" | "password" | "number" | "tel" | "url";
  onValueChange?: (value: string) => void;
  onCheckedChange?: (checked: boolean) => void;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const hasError = !!fieldState.error;

        const commonClasses = cn(
          "transition-colors",
          hasError && "border-destructive focus-visible:ring-destructive/20",
          !hasError && "border-input focus-visible:ring-ring/50"
        );

        switch (type) {
          case "select":
            return (
              <FormItem className={cn("space-y-2", className)}>
                {label && (
                  <FormLabel
                    className={cn(
                      "text-sm font-medium leading-none",
                      disabled && "cursor-not-allowed opacity-50",
                      hasError && "text-destructive"
                    )}
                  >
                    {label}
                    {required && (
                      <span className="text-destructive ml-1">*</span>
                    )}
                  </FormLabel>
                )}
                <Select
                  value={field.value || ""}
                  onValueChange={(value) => {
                    field.onChange(value);
                    onValueChange?.(value);
                  }}
                  disabled={disabled}
                >
                  <FormControl>
                    <SelectTrigger className={commonClasses}>
                      <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {options?.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {description && !hasError && (
                  <FormDescription>{description}</FormDescription>
                )}
                {hasError && <FormMessage />}
              </FormItem>
            );

          case "checkbox":
            return (
              <FormItem
                className={cn("flex items-center space-x-2", className)}
              >
                <FormControl>
                  <Checkbox
                    checked={field.value || false}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      onCheckedChange?.(!!checked);
                    }}
                    disabled={disabled}
                    className={commonClasses}
                  />
                </FormControl>
                {label && (
                  <FormLabel
                    className={cn(
                      "text-sm font-medium leading-none cursor-pointer",
                      disabled && "cursor-not-allowed opacity-50",
                      hasError && "text-destructive"
                    )}
                  >
                    {label}
                    {required && (
                      <span className="text-destructive ml-1">*</span>
                    )}
                  </FormLabel>
                )}
                {description && !hasError && (
                  <FormDescription className="ml-6">
                    {description}
                  </FormDescription>
                )}
                {hasError && <FormMessage className="ml-6" />}
              </FormItem>
            );

          case "text":
          default:
            return (
              <FormItem className={cn("space-y-2", className)}>
                {label && (
                  <FormLabel
                    className={cn(
                      "text-sm font-medium leading-none",
                      disabled && "cursor-not-allowed opacity-50",
                      hasError && "text-destructive"
                    )}
                  >
                    {label}
                    {required && (
                      <span className="text-destructive ml-1">*</span>
                    )}
                  </FormLabel>
                )}
                <FormControl>
                  <Input
                    type={inputType}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    value={field.value || ""}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      onValueChange?.(e.target.value);
                    }}
                    className={commonClasses}
                  />
                </FormControl>
                {description && !hasError && (
                  <FormDescription>{description}</FormDescription>
                )}
                {hasError && <FormMessage />}
              </FormItem>
            );
        }
      }}
    />
  );
}

/**
 * Convenience components for each field type
 */
export function TextFormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: Omit<TextFormFieldProps<TFieldValues, TName>, "type">) {
  return <UnifiedFormField {...props} type="text" />;
}

export function SelectFormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: Omit<SelectFormFieldProps<TFieldValues, TName>, "type">) {
  return <UnifiedFormField {...props} type="select" />;
}

export function CheckboxFormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: Omit<CheckboxFormFieldProps<TFieldValues, TName>, "type">) {
  return <UnifiedFormField {...props} type="checkbox" />;
}
