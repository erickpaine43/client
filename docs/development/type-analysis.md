# TypeScript Type Analysis Tool

## Overview

The TypeScript Type Analysis Tool is a CLI utility for analyzing TypeScript type definitions in a codebase. It identifies repeated types, categorizes them by architectural layers (Backend/DB vs Frontend/UI), and generates reports with consolidation recommendations.

## Features

### Core Capabilities

- **Type Parsing**: Uses TypeScript Compiler API to accurately parse type definitions from source files
- **Layer Categorization**: Automatically categorizes types into Backend/DB, Frontend/UI, and Shared/Common layers
- **Conflict Detection**: Identifies exact duplicates, semantic conflicts, and naming conflicts
- **Report Generation**: Creates detailed markdown reports with actionable recommendations
- **Performance**: Analyzes large codebases (thousands of types) in under 5 seconds

### Analysis Types

#### Exact Duplicate Detection
Identifies identical type definitions appearing in multiple locations. These are safe to consolidate.

```typescript
// Found in types/user.ts and types/common.ts
interface User {
  id: string;
  name: string;
  email: string;
}
```

#### Semantic Conflict Detection
Identifies types with the same name but different structures across architectural layers.

```typescript
// types/api/user.ts - Backend representation
interface User {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// components/UserForm.ts - Frontend representation
interface User {
  name: string;
  email: string;
  isActive: boolean;
}
```

#### Naming Conflict Detection
Identifies types with the same name in different contexts that may benefit from consolidation.

## Usage

### Basic Usage

```bash
# Analyze types in the default ./types directory
npm run type-analysis

# Analyze specific directory
npm run type-analysis -- --directory ./src/types

# Verbose output with detailed logging
npm run type-analysis -- --verbose
```

### Advanced Options

```bash
# Generate JSON output instead of markdown
npm run type-analysis -- --format json --output ./types-analysis.json

# Include external dependencies in analysis
npm run type-analysis -- --include-deps

# Custom output file
npm run type-analysis -- --output ./custom-report.md
```

### CLI Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--directory <dir>` | `-d` | Directory to analyze | `./types` |
| `--output <file>` | `-o` | Output file path | `./type-analysis-report.md` |
| `--format <format>` | `-f` | Output format: markdown or json | `markdown` |
| `--include-deps` | | Include external dependencies | `false` |
| `--verbose` | `-v` | Enable verbose logging | `false` |
| `--help` | `-h` | Show help message | |

## Report Structure

### Summary Section

```markdown
## Summary

- **Total Types**: 5787
- **Duplicated Types**: 5
- **Layer Conflicts**: 15

| Category | Count | Description |
|----------|-------|-------------|
| Backend/DB | 181 | Types related to database schemas, API responses |
| Frontend/UI | 326 | Types for UI components, form data |
| Shared/Common | 5280 | Common domain entities, validation schemas |
```

### Type Categories Section

Detailed breakdown of types by architectural layer with file locations and line numbers.

### Conflicts Section

Lists detected conflicts with resolution strategies:

- **Exact Duplicate**: Safe to merge into shared definitions
- **Semantic Conflict**: Requires creating layer-specific variants
- **Naming Conflict**: May benefit from renaming for clarity

### Recommendations Section

Actionable suggestions for type consolidation, ordered by impact and safety.

## Architecture

### Core Components

#### TypeParser
Uses TypeScript Compiler API to parse AST nodes and extract type definitions, imports, and exports.

#### TypeCategorizer
Applies rules-based categorization:
- **Backend/DB**: Files in `/api/`, `/database/`, `/backend/` paths
- **Frontend/UI**: Files in `/components/`, `/ui/`, `/pages/` paths
- **Shared/Common**: Default category for domain entities and utilities

#### ConflictDetector
Analyzes type groups for conflicts based on:
- **Exact Duplicates**: Identical structure and properties
- **Semantic Conflicts**: Same name, different layers, different structures
- **Naming Conflicts**: Same name, potentially different purposes

#### ReportGenerator
Creates structured reports with:
- Summary statistics and category breakdowns
- Detailed type listings with file locations
- Conflict analysis with resolution strategies
- Actionable recommendations

### File Structure

```
scripts/type-analysis/
├── cli/
│   └── analyze-types.ts      # Main CLI entry point
├── models/
│   ├── TypeDefinition.ts     # Type representation
│   ├── TypeCategory.ts       # Category definitions
│   └── TypeConflict.ts       # Conflict types and analysis
└── services/
    ├── TypeParser.ts         # AST parsing logic
    ├── TypeCategorizer.ts    # Layer categorization
    ├── ConflictDetector.ts   # Conflict detection
    └── ReportGenerator.ts    # Report generation
```

## Testing

### Unit Tests

Comprehensive unit test coverage for all services:

```bash
# Run all type analysis tests
npm test -- tests/unit/test_type_*.test.ts

# Run specific service tests
npm test -- tests/unit/test_conflict_detector.test.ts
```

### Integration Tests

End-to-end testing of the complete analysis workflow:

```bash
# Run integration tests
npm test -- tests/integration/
```

## Performance

### Benchmarks

- **Small Projects** (< 100 types): < 1 second
- **Medium Projects** (100-1000 types): < 2 seconds
- **Large Projects** (1000+ types): < 5 seconds

### Optimization Strategies

- **Incremental Parsing**: Only processes changed files when possible
- **AST Caching**: Reuses parsed AST nodes for multiple analyses
- **Parallel Processing**: Utilizes multiple CPU cores for large analyses
- **Memory Management**: Streams large reports to avoid memory issues

## Best Practices

### When to Run Analysis

1. **Before Major Refactoring**: Understand type dependencies
2. **After Adding New Types**: Verify architectural consistency
3. **During Code Reviews**: Automated type organization checks
4. **Before Releases**: Ensure type consolidation recommendations are addressed

### Interpreting Results

#### High Priority Conflicts
- **Exact Duplicates**: Always consolidate - zero risk
- **Breaking Semantic Conflicts**: Plan layer-specific variants
- **Cross-Layer Naming Conflicts**: Consider renaming for clarity

#### Low Priority Items
- **Non-Breaking Semantic Conflicts**: May be intentional for different use cases
- **Shared/Common Duplicates**: Often acceptable for utility types

### Type Organization Guidelines

1. **Backend/DB Types**: Database schemas, API request/response types
2. **Frontend/UI Types**: Component props, form data, UI state
3. **Shared/Common Types**: Domain entities, validation schemas, utilities

## Troubleshooting

### Common Issues

#### "No types found" Error
- Verify the directory path contains TypeScript files
- Check file extensions (.ts, .tsx)
- Ensure files are not empty or contain valid TypeScript syntax

#### "Analysis timeout" Error
- Reduce analysis scope with `--directory` option
- Exclude node_modules with custom directory selection
- Consider running on smaller subdirectories

#### "Memory issues" Error
- Use JSON output format for large codebases
- Split analysis into smaller directory chunks
- Ensure adequate system memory (4GB+ recommended)

### Debug Mode

Enable verbose logging to diagnose issues:

```bash
npm run type-analysis -- --verbose --directory ./problematic/dir
```

## Future Enhancements

### Planned Features

- **IDE Integration**: VS Code extension for real-time analysis
- **Git Hooks**: Pre-commit type organization validation
- **Custom Rules**: Configurable categorization and conflict rules
- **Historical Tracking**: Type evolution and architectural drift monitoring
- **Auto-Fix**: Automated consolidation suggestions and PR generation

### API Extensions

- **REST API**: Programmatic access to analysis results
- **Webhooks**: Real-time notifications for type conflicts
- **Plugin System**: Extensible analysis rules and custom categorizers
