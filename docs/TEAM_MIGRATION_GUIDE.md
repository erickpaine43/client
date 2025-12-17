# Team Migration Guide: New Documentation Structure

This guide helps team members transition from the old scattered documentation to the new consolidated structure. It provides practical steps for finding information, updating workflows, and contributing to the new system.

## Quick Start: Finding What You Need

### 🎯 Start Here: Central Navigation Hub

**New entry point**: [`docs/README.md`](./README.md)

This is your new starting point for all documentation. It provides:

- High-level system overview
- Navigation to all feature-specific documentation
- Links to development processes and troubleshooting guides

### 🔍 Common Documentation Locations

| What you're looking for      | Old location                    | New location                                                                                    |
| ---------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------- |
| Analytics system overview    | Multiple ANALYTICS\_\*.md files | [`docs/analytics/README.md`](./analytics/README.md)                                             |
| Analytics troubleshooting    | Scattered across multiple files | [`lib/services/analytics/troubleshooting.md`](../lib/services/analytics/troubleshooting.md)     |
| Convex setup and limitations | Multiple CONVEX\_\*.md files    | [`lib/services/analytics/convex-setup.md`](../lib/services/analytics/convex-setup.md)           |
| TypeScript patterns          | Various type-related files      | [`docs/types/README.md`](./types/README.md)                                                     |
| Development workflow         | Mixed with feature docs         | [`docs/development/README.md`](./development/README.md)                                         |
| Testing strategies           | Scattered across features       | [`docs/development/testing.md`](./development/testing.md)                                       |
| Authentication patterns      | AUTH\_\*.md files               | [`docs/development/authentication.md`](./development/authentication.md)                         |
| Billing implementation       | BILLING\_\*.md files            | [`lib/actions/billing/implementation-guide.md`](../lib/actions/billing/implementation-guide.md) |

## Migration Steps for Team Members

### Step 1: Update Your Bookmarks

**Replace these old bookmarks:**

- ❌ Individual ANALYTICS\_\*.md files
- ❌ CONVEX\_\*.md files
- ❌ MIGRATION\_\*.md files
- ❌ Various troubleshooting files

**With these new ones:**

- ✅ [`docs/README.md`](./README.md) - Start here for everything
- ✅ [`docs/analytics/README.md`](./analytics/README.md) - Analytics system
- ✅ [`lib/services/analytics/troubleshooting.md`](../lib/services/analytics/troubleshooting.md) - Analytics issues
- ✅ [`docs/development/troubleshooting.md`](./development/troubleshooting.md) - General issues

### Step 2: Update Your Development Workflow

#### When Starting Work on Analytics Features

**Old workflow:**

1. Search through multiple ANALYTICS\_\*.md files
2. Check various troubleshooting documents
3. Look for patterns in scattered files

**New workflow:**

1. Start at [`docs/analytics/README.md`](./analytics/README.md)
2. Navigate to specific service docs: [`lib/services/analytics/README.md`](../lib/services/analytics/README.md)
3. Check feature-specific troubleshooting: [`lib/services/analytics/troubleshooting.md`](../lib/services/analytics/troubleshooting.md)

#### When Working with Types

**Old workflow:**

1. Search through various type-related files
2. Check multiple documentation sources

**New workflow:**

1. Start at [`docs/types/README.md`](./types/README.md)
2. Navigate to specific type docs: [`types/analytics/README.md`](../types/analytics/README.md)
3. Check type limitations: [`types/analytics/type-limitations.md`](../types/analytics/type-limitations.md)

#### When Troubleshooting Issues

**Old workflow:**

1. Search through multiple troubleshooting files
2. Check various migration and cleanup documents

**New workflow:**

1. Start with general troubleshooting: [`docs/development/troubleshooting.md`](./development/troubleshooting.md)
2. Navigate to feature-specific guides via links
3. Check component-specific issues: [`components/analytics/troubleshooting.md`](../components/analytics/troubleshooting.md)

### Step 3: Update Documentation References

#### In Code Comments

**Update references like:**

```typescript
// Old: See ANALYTICS_MIGRATION_PLAN.md for details
// New: See lib/services/analytics/README.md for architecture details

// Old: Check CONVEX_SETUP.md for configuration
// New: See lib/services/analytics/convex-setup.md for configuration

// Old: Refer to BILLING_MODULE_FIX_IMPLEMENTATION_GUIDE.md
// New: See lib/actions/billing/implementation-guide.md
```

#### In Pull Request Templates

**Update PR template references:**

```markdown
<!-- Old -->

- [ ] Updated relevant documentation (check ANALYTICS\_\*.md files)
- [ ] Reviewed troubleshooting guides in various files

<!-- New -->

- [ ] Updated relevant documentation (see docs/README.md for structure)
- [ ] Updated feature-specific docs if needed (co-located with code)
```

#### In Issue Templates

**Update issue template references:**

```markdown
<!-- Old -->

**Documentation checked:**

- [ ] ANALYTICS_TROUBLESHOOTING.md
- [ ] CONVEX_LIMITATIONS.md
- [ ] Various migration files

<!-- New -->

**Documentation checked:**

- [ ] docs/development/troubleshooting.md
- [ ] Feature-specific troubleshooting (linked from main docs)
- [ ] lib/services/[feature]/troubleshooting.md
```

## New Documentation Patterns

### Co-location Principle

**Key Change**: Documentation now lives close to the code it describes.

**Examples:**

- Analytics service docs: `lib/services/analytics/README.md`
- Analytics component docs: `components/analytics/README.md`
- Analytics type docs: `types/analytics/README.md`

**Benefits:**

- Easier to keep docs in sync with code
- Natural discovery when working in specific areas
- Clear ownership and responsibility

### Hierarchical Navigation

**Structure:**

```
docs/README.md (Central hub)
├── docs/analytics/README.md (System overview)
├── docs/types/README.md (Type system overview)
├── docs/development/README.md (Development processes)
└── Feature-specific docs (co-located with code)
    ├── lib/services/analytics/README.md
    ├── components/analytics/README.md
    └── types/analytics/README.md
```

**Navigation Pattern:**

1. Start at central hub
2. Navigate to system overview
3. Follow links to specific implementation docs

### Separation of Current vs Historical

**Current State Documentation:**

- Focus on how things work today
- Architectural decisions and rationale
- Current best practices and patterns

**Historical Context:**

- Separate "evolution" or "lessons learned" sections
- Migration history in dedicated files
- Context for why decisions were made

## Contributing to the New Structure

### Adding New Documentation

#### For New Features

1. **Create feature-specific docs** co-located with code:

   ```
   lib/services/new-feature/
   ├── README.md (architecture and usage)
   ├── troubleshooting.md (common issues)
   └── testing.md (testing strategies)
   ```

2. **Update central navigation** in [`docs/README.md`](./README.md)

3. **Add cross-references** from related documentation

#### For General Development Topics

1. **Add to appropriate section** in `docs/development/`
2. **Update navigation** in [`docs/development/README.md`](./development/README.md)
3. **Cross-reference** from feature-specific docs

### Updating Existing Documentation

#### When Making Code Changes

1. **Check co-located docs** in the same directory
2. **Update examples** and code snippets
3. **Verify cross-references** are still accurate
4. **Run validation scripts** before committing

#### When Fixing Issues

1. **Update troubleshooting guides** with new solutions
2. **Add to appropriate feature-specific docs**
3. **Cross-reference** from general troubleshooting if applicable

### Documentation Review Process

#### For Code PRs with Doc Changes

1. **Code reviewer** checks technical accuracy
2. **Documentation owner** reviews for consistency and clarity
3. **Automated checks** validate links and references

#### For Documentation-Only PRs

1. **Primary owner** reviews content
2. **Secondary reviewer** checks for clarity and completeness
3. **Automated validation** ensures structural integrity

## Tools and Automation

### Validation Scripts

Run these locally before committing documentation changes:

```bash
# Validate all links
npm run docs:validate-links

# Check cross-references
npm run docs:validate-references

# Check for outdated content
npm run docs:check-freshness

# Run all validations
npm run docs:validate-all
```

### IDE Integration

**Recommended VS Code Extensions:**

- Markdown All in One
- Markdown Preview Enhanced
- markdownlint

**Workspace Settings:**

```json
{
  "markdown.preview.breaks": true,
  "markdown.extension.toc.levels": "2..6",
  "markdownlint.config": {
    "MD013": false,
    "MD033": false
  }
}
```

### GitHub Integration

**Automated Checks:**

- Link validation runs on every documentation change
- Cross-reference validation runs daily
- Freshness checks run weekly

**Notifications:**

- Broken links trigger immediate alerts
- Stale content alerts sent to document owners
- Validation failures block PR merges

## Troubleshooting the Migration

### Can't Find Old Information

1. **Check the central hub**: [`docs/README.md`](./README.md)
2. **Search by topic** rather than old file name
3. **Look in feature-specific directories** co-located with code
4. **Check extraction reports** in `.kiro/specs/documentation-consolidation/`

### Links Not Working

1. **Run link validator**: `npm run docs:validate-links`
2. **Check for moved files** in the new structure
3. **Update references** to use new paths
4. **Report persistent issues** to documentation owners

### Information Seems Missing

1. **Check related feature directories** for co-located docs
2. **Look in "lessons learned"** sections for historical context
3. **Search extraction reports** for content that might have been consolidated
4. **Contact document owners** if critical information is missing

### Process Questions

1. **Review this migration guide** for common patterns
2. **Check the maintenance process**: [`docs/DOCUMENTATION_MAINTENANCE_PROCESS.md`](./DOCUMENTATION_MAINTENANCE_PROCESS.md)
3. **Contact documentation owners**: [`docs/DOCUMENTATION_OWNERSHIP.md`](./DOCUMENTATION_OWNERSHIP.md)
4. **Escalate to Technical Lead** for structural questions

## Timeline and Expectations

### Immediate (Week 1-2)

- **Update bookmarks** to new documentation locations
- **Start using central hub** as entry point
- **Report any missing critical information**

### Short-term (Month 1)

- **Adapt workflows** to new documentation patterns
- **Update code references** to point to new locations
- **Contribute improvements** based on usage experience

### Long-term (Ongoing)

- **Follow new contribution patterns** for documentation
- **Participate in regular reviews** and feedback sessions
- **Help maintain quality** through validation and updates

## Getting Help

### Quick Help

- **Slack**: #documentation-help
- **GitHub Issues**: Use "documentation" label
- **Direct Contact**: See [`docs/DOCUMENTATION_OWNERSHIP.md`](./DOCUMENTATION_OWNERSHIP.md)

### Training Sessions

- **Weekly office hours**: Tuesdays 2-3 PM
- **On-demand training**: Contact @tech-lead
- **Team workshops**: Monthly documentation reviews

### Feedback and Improvements

- **Feedback form**: [Link to feedback form]
- **Retrospectives**: Include documentation topics
- **Suggestions**: Create GitHub issues with "documentation-improvement" label

## Success Metrics

We'll measure the success of this migration by:

- **Reduced time to find information** (target: 50% reduction)
- **Increased documentation accuracy** (target: 95% link validity)
- **Better maintenance** (target: 90% of docs updated within 30 days of code changes)
- **Team satisfaction** (target: 80% positive feedback on new structure)

Your participation and feedback are crucial to achieving these goals and continuously improving our documentation system.

---

**Questions?** Contact the documentation team or create an issue with the "documentation" label.
