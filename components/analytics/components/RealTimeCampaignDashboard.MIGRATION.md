---
title: "or"
description: "Documentation for or - RealTimeCampaignDashboard.MIGRATION"
last_modified_date: "2025-11-19"
level: 2
persona: "Documentation Users"
---

Purpose

This document describes the expected outcome for the consumer-side migration of `RealTimeCampaignDashboard.tsx`, and how to rebuild / verify the project after changes.

Expected outcome

- The dashboard component must normalize any incoming analytics shapes into the canonical `PerformanceMetrics` core type.
- All derived rates (open/click/reply) and the health score must be computed using `AnalyticsCalculator` (single source of truth) in the UI layer (consumer-first approach).
- The component should avoid unsafe `as` casts to the core type; instead create small local typed adapters / type guards and coerce numeric fields explicitly via `Number(...)`.
- Hook signatures should not be changed in provider code; instead convert `AnalyticsFilters` to the hook-specific `CampaignFilters` using `analyticsDateRangeToCampaignRange()` before calling hooks.
- The component should be syntactically valid TypeScript/React and keep UI complexity minimal during the migration pass. It should prefer small, well-typed helper functions and memoized calculations (`useMemo`) for chart and table inputs.

Rebuild & verification steps

1. Install dependencies (if needed):

```bash
npm ci
```

2. Run TypeScript typecheck (fast smoke):

```bash
npm run typecheck
# or
npx tsc -p tsconfig.json --noEmit --skipLibCheck
```

3. Run lint (optional):

```bash
npm run lint
```

4. Start local dev server (full build/preview):

```bash
npm run dev
```

5. Full production build (to verify build-time issues):

```bash
npm run build
```

If type errors appear, focus on the modified file(s) first. Use `npx tsc --noEmit --skipLibCheck` and open the file path reported to fix syntax/typing issues.

Notes

- This is a consumer-only migration: do not change provider hook return shapes as part of this pass unless absolutely necessary. Convert inputs at the call site.
- Keep the component small and testable. After this file is stable, apply the same approach to other consumer components.

Contact

If you need the previous (larger) version restored, it's available in the branch history or in the earlier patch logs. Use git to inspect the diffs and revert if needed.
