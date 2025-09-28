/**
 * Validation utilities - Main export file
 * 
 * Re-exports all validation functions from domain-specific modules
 * to maintain backward compatibility.
 */

// Core validation types and utilities
export * from './core';

// Domain-specific validators
export * from './analytics';
export * from './auth';
export * from './common';
export * from './schema';

// Legacy exports for backward compatibility
export { Validators } from './core';

// Domain-specific validator objects
export { AuthValidators } from './auth';
export { CommonValidators } from './common';
