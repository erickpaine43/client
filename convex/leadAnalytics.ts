// ============================================================================
// LEAD ANALYTICS - MAIN BARREL EXPORT
// ============================================================================
// This file now serves as the main entry point for the modular leadAnalytics structure.
// All functionality has been refactored into focused modules for better maintainability:
//
// - types.ts: Type definitions and interfaces
// - validation.ts: Input validation and sanitization
// - calculations.ts: Business logic and calculation utilities
// - queries.ts: All Convex query handlers
// - mutations.ts: All Convex mutation handlers
// - index.ts: Barrel exports for API compatibility
//
// This approach ensures:
// ✅ Single responsibility per file
// ✅ Better testability and maintainability
// ✅ Comprehensive type safety
// ✅ Enhanced developer experience
// ✅ 100% backward compatibility

export * from "./leadAnalytics/index";
