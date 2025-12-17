# Testing Strategies and Best Practices

## Overview

This document outlines comprehensive testing strategies for the project, including unit testing, integration testing, component testing, and end-to-end testing approaches. The goal is to ensure code quality, prevent regressions, and provide confidence in deployments.

## Testing Philosophy

- **Behavior over Implementation**: Test what the code does, not how it does it
- **Test Pyramid**: Prioritize unit tests, followed by integration and E2E tests
- **Co-located Tests**: Keep tests close to the code they test
- **Continuous Testing**: Run tests frequently during development

## Testing Stack

- **Jest**: Primary testing framework
- **React Testing Library**: Component testing utilities
- **Testing Library**: DOM testing utilities
- **Jest DOM**: Custom matchers for DOM assertions
- **MSW (Mock Service Worker)**: API mocking for integration tests

## Test Organization

### File Structure

```
__tests__/
├── unit/           # Pure unit tests
├── integration/    # API and service integration tests
└── e2e/           # End-to-end tests

*.test.ts          # Co-located tests for modules
*.spec.tsx         # Component tests
```

### Naming Conventions

- `*.test.ts` - Unit tests for utilities and services
- `*.spec.tsx` - Component tests
- `*.integration.test.ts` - Integration tests
- `*.e2e.test.ts` - End-to-end tests

## Unit Testing

### Service Testing

```typescript
// Example: CampaignAnalyticsService.test.ts
import { CampaignAnalyticsService } from '../CampaignAnalyticsService';

describe('CampaignAnalyticsService', () => {
  let service: CampaignAnalyticsService;

  beforeEach(() => {
    service = new CampaignAnalyticsService();
  });

  describe('calculateOpenRate', () => {
    it('should calculate open rate correctly', () => {
      const result = service.calculateOpenRate(100, 25);
      expect(result).toBe(25);
    });

    it('should handle zero sent emails', () => {
      const result = service.calculateOpenRate(0, 0);
      expect(result).toBe(0);
    });

    it('should handle edge cases', () => {
      expect(() => service.calculateOpenRate(-1, 5)).toThrow();
    });
  });
});
```

### Utility Function Testing

```typescript
// Example: dateUtils.test.ts
import { formatDate, isValidDate } from '../dateUtils';

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15');
      expect(formatDate(date)).toBe('2024-01-15');
    });
  });

  describe('isValidDate', () => {
    it('should validate dates correctly', () => {
      expect(isValidDate(new Date())).toBe(true);
      expect(isValidDate('invalid')).toBe(false);
      expect(isValidDate(null)).toBe(false);
    });
  });
});
```

## Component Testing

### Basic Component Test

```typescript
// Example: AnalyticsCard.spec.tsx
import { render, screen } from '@testing-library/react';
import { AnalyticsCard } from './AnalyticsCard';

describe('AnalyticsCard', () => {
  it('should render title and value', () => {
    render(<AnalyticsCard title="Open Rate" value="25%" />);

    expect(screen.getByText('Open Rate')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    render(<AnalyticsCard loading={true} />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<AnalyticsCard className="custom-class" />);

    const card = screen.getByRole('article');
    expect(card).toHaveClass('custom-class');
  });
});
```

### Component with Hooks

```typescript
// Example: CampaignList.spec.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { CampaignList } from './CampaignList';

const mockCampaigns = [
  { id: '1', name: 'Campaign 1', status: 'active' },
  { id: '2', name: 'Campaign 2', status: 'draft' }
];

jest.mock('../../hooks/useCampaigns', () => ({
  useCampaigns: () => ({
    campaigns: mockCampaigns,
    loading: false,
    error: null
  })
}));

describe('CampaignList', () => {
  it('should render campaign list', async () => {
    render(<CampaignList />);

    await waitFor(() => {
      expect(screen.getByText('Campaign 1')).toBeInTheDocument();
      expect(screen.getByText('Campaign 2')).toBeInTheDocument();
    });
  });
});
```

## Integration Testing

### API Integration Testing

```typescript
// Example: analyticsService.integration.test.ts
import { rest } from 'msw';
import { server } from '../../../__mocks__/server';
import { analyticsService } from '../analyticsService';

describe('Analytics Service Integration', () => {
  it('should fetch campaign stats', async () => {
    server.use(
      rest.get('/api/analytics/campaign/:id', (req, res, ctx) => {
        return res(ctx.json({
          openRate: 25,
          clickRate: 10,
          bounceRate: 5
        }));
      })
    );

    const result = await analyticsService.getCampaignStats('campaign-1');

    expect(result).toEqual({
      openRate: 25,
      clickRate: 10,
      bounceRate: 5
    });
  });
});
```

### Convex Integration Testing

```typescript
// Example: convexQueries.integration.test.ts
import { ConvexReactClient } from 'convex/react';
import { convexQuery } from '@convex-dev/test';

describe('Convex Queries', () => {
  let client: ConvexReactClient;

  beforeEach(() => {
    client = new ConvexReactClient('http://localhost:3210');
  });

  it('should fetch user campaigns', async () => {
    const result = await convexQuery(
      client,
      api.campaigns.getUserCampaigns,
      { userId: 'user-1' }
    );

    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('name');
  });
});
```

## End-to-End Testing

### E2E Test Example

```typescript
// Example: campaignCreation.e2e.test.ts
import { test, expect } from '@playwright/test';

test.describe('Campaign Creation', () => {
  test('should create a new campaign', async ({ page }) => {
    await page.goto('/campaigns/new');

    await page.fill('[name="name"]', 'Test Campaign');
    await page.selectOption('[name="type"]', 'email');
    await page.click('[type="submit"]');

    await expect(page).toHaveURL(/\/campaigns\/.+/);
    await expect(page.locator('h1')).toContainText('Test Campaign');
  });
});
```

## Testing Best Practices

### Test Structure

```typescript
describe('Feature Name', () => {
  describe('when condition', () => {
    it('should behave correctly', () => {
      // Arrange
      const input = 'test input';

      // Act
      const result = functionUnderTest(input);

      // Assert
      expect(result).toBe('expected output');
    });
  });
});
```

### Mocking Strategies

- **External Dependencies**: Mock APIs, databases, and external services
- **Complex Objects**: Use factories for consistent test data
- **Time-Dependent Code**: Mock Date and timers
- **Random Values**: Seed random number generators for predictable tests

### Test Data Management

```typescript
// Test data factory
const createCampaign = (overrides = {}) => ({
  id: 'campaign-1',
  name: 'Test Campaign',
  status: 'active',
  createdAt: new Date(),
  ...overrides
});

describe('CampaignService', () => {
  it('should update campaign', async () => {
    const campaign = createCampaign();
    const updates = { name: 'Updated Campaign' };

    const result = await service.update(campaign.id, updates);

    expect(result.name).toBe('Updated Campaign');
  });
});
```

## Test Coverage

### Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 85%
- **Lines**: > 80%

### Coverage Configuration

```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts'
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 85,
      lines: 80
    }
  }
};
```

## Running Tests

### Local Development

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test CampaignAnalyticsService.test.ts
```

### CI/CD Integration

Tests run automatically on:
- Pull requests
- Main branch pushes
- Release branches

## Debugging Tests

### Common Issues

1. **Async Tests**: Ensure proper awaiting of promises
2. **Mock Cleanup**: Reset mocks between tests
3. **DOM Assertions**: Use proper queries for elements
4. **Timing Issues**: Handle asynchronous operations correctly

### Debugging Tools

- **Jest Debugger**: Use `--inspect` flag
- **React Testing Library Debug**: `screen.debug()`
- **Coverage Reports**: Analyze uncovered code paths

## Performance Testing

### Load Testing

```typescript
// Example load test
import { check } from 'k6';
import http from 'k6/http';

export let options = {
  vus: 10,
  duration: '30s',
};

export default function () {
  const response = http.get('http://localhost:3000/api/analytics');
  check(response, { 'status is 200': (r) => r.status === 200 });
}
```

## Testing Checklist

- [ ] Tests are co-located with code
- [ ] Test names describe behavior, not implementation
- [ ] Tests cover happy path and error cases
- [ ] Async operations are properly tested
- [ ] Mocks are used appropriately
- [ ] Test data is realistic
- [ ] Coverage meets thresholds
- [ ] Tests run in CI/CD pipeline

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library](https://testing-library.com/docs/)
- [Playwright Documentation](https://playwright.dev/)
