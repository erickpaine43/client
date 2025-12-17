# Testing Guide

## Overview

This guide explains how to add tests to the PenguinMails project following Test-Driven Development (TDD) principles.

## Test Structure

### Test Directories
- `tests/contract/` - Contract tests for API specifications
- `tests/integration/` - Integration tests for end-to-end scenarios
- `lib/niledb/__tests__/` - Unit and integration tests for NileDB services
- `components/**/__tests__/` - Component tests
- `scripts/__tests__/` - Script tests

## TDD Workflow

### 1. Write Failing Tests First
Before implementing any feature, write tests that define the expected behavior:

```typescript
// Example: tests/integration/test_new_feature.ts
describe('New Feature Integration Test', () => {
  test('should perform new feature successfully', () => {
    // Test will fail initially
    expect(() => {
      // Call the feature function
    }).not.toThrow();
  });
});
```

### 2. Run Tests to Confirm Failure
```bash
npm test
# or specific test
npm run test:migration
```

### 3. Implement Feature
Write the minimum code to make tests pass.

### 4. Run Tests to Confirm Success
Ensure all tests pass.

## Test Types

### Contract Tests
- Test API contracts defined in `specs/*/contracts/`
- Validate JSON schemas and requirements
- Located in `tests/contract/`

### Integration Tests
- Test end-to-end scenarios
- May require database connectivity
- Located in `tests/integration/`

### Unit Tests
- Test individual functions/services
- Mock external dependencies
- Located alongside code in `__tests__/` directories

## Running Tests

### All Tests
```bash
npm test
```

### Specific Test Suites
```bash
npm run test:migration      # Migration tests
npm run test:api-routes     # API integration tests
npm run test:comprehensive  # Full test suite
```

### Development
```bash
# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

## Test Configuration

- **Framework**: Jest
- **Config**: `jest.config.js`
- **Environment**: Uses `.env.test` for test database
- **Database**: Test database at `test.db.thenile.dev` (may not be available locally)

## Best Practices

### Test Naming
- Use descriptive names: `should [expected behavior] when [condition]`
- Group related tests in `describe` blocks

### Test Isolation
- Each test should be independent
- Use proper setup/teardown
- Mock external services when possible

### Assertions
- Use specific assertions (not just `toBeTruthy`)
- Test both success and error cases
- Verify data integrity

### Database Tests
- Clean up test data after each test
- Use transactions for isolation
- Avoid dependencies on specific data

## Adding New Tests

1. Determine test type and location
2. Write test following TDD (fail first)
3. Implement feature to make test pass
4. Run full test suite to ensure no regressions
5. Update this guide if needed

## Troubleshooting

### Database Connection Issues
If tests fail with `ENOTFOUND test.db.thenile.dev`:
- Test database may not be available
- Some tests require live database connection
- Focus on unit tests that don't require DB

### Test Timeout
Increase timeout for integration tests:
```typescript
test('slow test', async () => {
  // ...
}, 10000);
```

### Mocking
Use Jest mocks for external dependencies:
```typescript
jest.mock('external-service');
