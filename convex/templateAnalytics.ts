// ============================================================================
// TEMPLATE ANALYTICS - MODULAR REFACTOR
// ============================================================================

/**
 * Template Analytics Convex Functions
 *
 * This file has been refactored into a modular structure for better maintainability.
 * All functions are now exported from the ./templateAnalytics/ directory.
 *
 * The modular structure includes:
 * - types.ts: All TypeScript interfaces and types
 * - validation.ts: Input validation and sanitization functions
 * - calculations.ts: Pure calculation and aggregation utilities
 * - queries.ts: All query handler functions
 * - mutations.ts: All mutation handler functions
 * - index.ts: Barrel exports for all modules
 */

// Re-export everything from the modular structure
export * from "./templateAnalytics/index";
