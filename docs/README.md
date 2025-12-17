# Documentation Hub

Welcome to the project documentation. This hub provides organized access to all project documentation, from high-level architecture to specific implementation guides.

## Quick Navigation

### 🏗️ Architecture & Design

- [Analytics System](./analytics/README.md) - Analytics architecture and service organization
- [Type System](./types/README.md) - TypeScript organization and patterns

### 🛠️ Development

- [Development Workflow](./development/README.md) - Testing, troubleshooting, and general development patterns
- [Authentication](./development/authentication.md) - Authentication patterns and security
- [Migration Patterns](./development/migration-patterns.md) - Reusable migration strategies
- [Convex Integration](./development/convex-limitations.md) - Platform constraints and workarounds
- [Analytics Migration Guide](./development/analytics-migration-guide.md) - Type migration patterns and best practices
- [Analytics Type Limitations](./development/analytics-type-limitations.md) - Convex and TypeScript constraints
- [Settings Integration Lessons](./development/settings-integration-lessons.md) - Server/client data separation patterns
- [Authentication Implementation](./development/authentication-implementation.md) - Comprehensive auth system guide
- [Billing Testing Guide](./development/billing-testing-guide.md) - Complete billing module testing strategies
- [Billing Troubleshooting](./development/billing-troubleshooting.md) - Billing system diagnostic procedures

### 🚀 Infrastructure

- [Cloudflare Setup](./infrastructure/cloudflare.md) - Cloudflare configuration and deployment
- [Convex Setup](./infrastructure/convex.md) - Convex configuration and best practices

## Feature-Specific Documentation

Documentation is co-located with code for better maintainability:

### Services

- [Analytics Services](../lib/services/analytics/README.md) - Service architecture and troubleshooting
- [Profile Services](../lib/services/profile/README.md) - Profile integration patterns

### Actions

- [Core Actions](../lib/actions/core/README.md) - Authentication and core functionality
- [Billing Actions](../lib/actions/billing/README.md) - Billing implementation and testing

### Components

- [Analytics Components](../components/analytics/README.md) - Component organization and patterns

### Types

- [Analytics Types](../types/analytics/README.md) - Analytics type organization
- [Domain Types](../types/domains/README.md) - Domain type system

## Documentation Principles

This documentation follows these principles:

1. **Current-State Focus**: Documentation emphasizes how the system works today
2. **Co-location**: Feature-specific docs live near the code they document
3. **Clear Navigation**: Easy cross-referencing between related concepts
4. **Separation of Concerns**: Current operational knowledge separated from historical context

## Documentation Maintenance

### Automated Quality Checks

Use the documentation maintenance tool to ensure quality:

```bash
# Run all documentation checks
npm run docs:maintenance

# Individual checks
npm run docs:maintenance links      # Validate markdown links
npm run docs:maintenance references # Check cross-references
npm run docs:maintenance freshness  # Check content age
```

### Manual Review Guidelines

- **Links**: Ensure all internal links work and external links are current
- **Cross-References**: Verify related documents are properly linked
- **Freshness**: Review and update content older than recommended age
- **Accuracy**: Keep documentation aligned with current code state

## Contributing

When adding new documentation:

1. **Central Hub** (`docs/`): High-level architecture, cross-cutting concerns, platform knowledge
2. **Feature-Specific**: Co-locate with relevant code in `lib/`, `components/`, `types/`
3. **Cross-Reference**: Link related documents for easy navigation
4. **Keep Current**: Focus on present-state information, move historical context to dedicated sections
5. **Validate**: Run `npm run docs:maintenance` before committing changes

## Getting Started

New to the project? Start here:

1. [Analytics System Overview](./analytics/README.md) - Understand the core analytics architecture
2. [Development Workflow](./development/README.md) - Learn the development process
3. [Type System](./types/README.md) - Understand TypeScript organization

For specific tasks:

- **Setting up locally**: [Infrastructure docs](./infrastructure/)
- **Working with analytics**: [Analytics services](../lib/services/analytics/README.md)
- **Troubleshooting**: [Development troubleshooting](./development/troubleshooting.md)
