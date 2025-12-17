# Analytics System Architecture

## Overview

The analytics system provides comprehensive tracking and reporting capabilities across campaigns, domains, mailboxes, and templates. The system is built on domain-driven design principles with a clear separation between data collection and UI presentation.

## Core Principles

### Single Source of Truth

All analytics data flows through standardized services that ensure consistency across the application. Each metric has a single, authoritative calculation method.

### Data vs UI Separation

The analytics system maintains clear boundaries:

- **Data Layer**: Convex-based services handle data collection, storage, and calculations
- **Service Layer**: TypeScript services provide business logic and data transformation
- **UI Layer**: React components consume processed data through standardized hooks

### Domain-Driven Design

Analytics are organized by business domain:

- **Campaign Analytics**: Campaign performance, sequence steps, lead generation
- **Domain Analytics**: Domain reputation, deliverability metrics
- **Mailbox Analytics**: Individual mailbox performance and health
- **Template Analytics**: Template usage and effectiveness

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Analytics System                         │
├─────────────────────────────────────────────────────────────┤
│  UI Layer (React Components)                               │
│  ├── Dashboard Components                                  │
│  ├── Analytics Cards                                       │
│  └── Chart Components                                      │
├─────────────────────────────────────────────────────────────┤
│  Service Layer (TypeScript Services)                       │
│  ├── Campaign Analytics Service                            │
│  ├── Domain Analytics Service                              │
│  ├── Mailbox Analytics Service                             │
│  └── Template Analytics Service                            │
├─────────────────────────────────────────────────────────────┤
│  Data Layer (Convex)                                       │
│  ├── Analytics Queries                                     │
│  ├── Analytics Mutations                                   │
│  └── Analytics Calculations                                │
└─────────────────────────────────────────────────────────────┘
```

## Standardized Metrics

### Key Performance Indicators (KPIs)

**Campaign Metrics**:

- Open Rate: (Opens / Sent) × 100
- Click Rate: (Clicks / Sent) × 100
- Reply Rate: (Replies / Sent) × 100
- Bounce Rate: (Bounces / Sent) × 100

**Domain Metrics**:

- Domain Reputation Score: Calculated based on deliverability factors
- Deliverability Rate: (Delivered / Sent) × 100
- Spam Rate: (Spam Reports / Sent) × 100

**Mailbox Metrics**:

- Mailbox Health Score: Composite score based on multiple factors
- Send Volume: Total emails sent per time period
- Response Rate: (Responses / Sent) × 100

### Calculation Standards

All metrics follow consistent calculation patterns:

1. **Deterministic Operations**: Same inputs always produce same outputs
2. **Index-Optimized**: Calculations leverage Convex indexes for performance
3. **Cache-Friendly**: Results are structured for efficient caching
4. **Type-Safe**: All calculations use strongly-typed interfaces

## Navigation

### Service Documentation

- [Analytics Services Architecture](../../lib/services/analytics/README.md)
- [Service Troubleshooting](../../lib/services/analytics/troubleshooting.md)
- [Convex Setup Guide](../../lib/services/analytics/convex-setup.md)
- [Convex Limitations](../../lib/services/analytics/convex-limitations.md)

### Component Documentation

- [Analytics Components](../../components/analytics/README.md)
- [Component Troubleshooting](../../components/analytics/troubleshooting.md)

### Type System

- [Analytics Types](../../types/analytics/README.md)
- [Type Limitations](../../types/analytics/type-limitations.md)

### Development Resources

- [Testing Strategies](../../lib/services/analytics/testing.md)
- [Migration Lessons](../../lib/services/analytics/migration-lessons.md)
- [Performance Patterns](../development/convex-limitations.md#analytics-performance)

## Database Strategy

The analytics system uses a hybrid approach:

### OLTP (Online Transaction Processing)

- Real-time data collection during user interactions
- Immediate updates for campaign actions (opens, clicks, replies)
- Transactional consistency for critical operations

### OLAP (Online Analytical Processing)

- Batch processing for complex aggregations
- Historical trend analysis and reporting
- Optimized read queries for dashboard displays

## Integration Patterns

### Convex Integration

The analytics system integrates with Convex through:

- **Queries**: Read-optimized data retrieval
- **Mutations**: Transactional data updates
- **Actions**: External API integrations and complex processing

### Service Integration

Analytics services integrate with:

- **Campaign System**: Track campaign performance
- **Domain Management**: Monitor domain health
- **Mailbox Management**: Track mailbox performance
- **Template System**: Measure template effectiveness

## Performance Considerations

### Index Strategy

- Compound indexes for common query patterns
- Time-based partitioning for historical data
- Selective indexing to minimize storage overhead

### Caching Strategy

- Service-level caching for frequently accessed data
- Component-level caching for UI performance
- Invalidation strategies for real-time updates

### Query Optimization

- Batch operations for bulk data processing
- Pagination for large result sets
- Selective field retrieval to minimize data transfer

## Business Context

For business rationale and strategic context behind the analytics system:

- [Business Context](./business-context.md) - Strategic justification and business requirements

## Getting Started

1. **Understanding the Architecture**: Start with [Service Architecture](../../lib/services/analytics/README.md)
2. **Setting Up Analytics**: Follow the [Convex Setup Guide](../../lib/services/analytics/convex-setup.md)
3. **Common Issues**: Check [Troubleshooting Guide](../../lib/services/analytics/troubleshooting.md)
4. **Type System**: Review [Analytics Types](../../types/analytics/README.md)

## Architecture Deep Dive

For detailed system architecture information, see:

- [System Architecture](./architecture.md) - Comprehensive architectural overview
- [Service Architecture](../../lib/services/analytics/README.md) - Implementation details

## Evolution and History

For historical context and migration lessons, see:

- [Migration Lessons Learned](../../lib/services/analytics/migration-lessons.md)
- [Architectural Evolution](./architecture.md#evolution-and-scalability)
- [Refactoring Decisions](../../lib/services/analytics/migration-lessons.md#refactoring-decisions)
