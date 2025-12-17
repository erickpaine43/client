# Development Troubleshooting Guide

## Overview

This guide covers common issues encountered during development and their solutions. For feature-specific troubleshooting, see the documentation co-located with the relevant code.

## Common Issues

### TypeScript Errors

#### "Type instantiation is excessively deep and possibly infinite"

**Symptoms**: TypeScript compiler errors with complex Convex types
**Cause**: Convex type system complexity interacting with TypeScript's type inference
**Solution**: Use type assertions with explanatory comments

```typescript
// @ts-expect-error - Convex type instantiation is excessively deep (platform limitation)
const result = await convex.query(api.analytics.getCampaignStats, args);

// Alternative: Simplify types
type SimplifiedStats = Pick<CampaignStats, "openRate" | "clickRate">;
const stats: SimplifiedStats = result;
```

**Related**: [Convex Limitations](./convex-limitations.md#type-system-limitations)

#### "Cannot find module" errors

**Symptoms**: Import errors for existing files
**Cause**: Incorrect import paths or missing type definitions
**Solution**: Check import paths and type definitions

```typescript
// ❌ Incorrect relative path
import { AnalyticsService } from "../services/analytics";

// ✅ Correct relative path
import { AnalyticsService } from "../../lib/services/analytics";

// ✅ Use absolute imports when configured
import { AnalyticsService } from "@/lib/services/analytics";
```

#### Unused variable warnings

**Symptoms**: ESLint warnings about unused variables
**Cause**: Variables needed for future use or type checking
**Solution**: Prefix with underscore to indicate intentional

```typescript
// ❌ ESLint warning
const { data, error } = useQuery();

// ✅ Indicate intentional unused variable
const { data, error: _error } = useQuery();
```

### Convex Integration Issues

#### Query/Mutation not found

**Symptoms**: Runtime errors about missing Convex functions
**Cause**: Function not exported or incorrect import path
**Solution**: Check function exports and regenerate Convex types

```bash
# Regenerate Convex types
npx convex dev

# Check function exports
# In convex/analytics.ts
export { getCampaignStats } from './analytics/queries';
```

#### Authentication errors in Convex functions

**Symptoms**: "User not authenticated" errors
**Cause**: Missing authentication context or expired session
**Solution**: Check authentication middleware and session handling

```typescript
// Ensure authentication context is passed
const authenticatedCtx = await withAuthentication(ctx);
const result = await someAuthenticatedOperation(authenticatedCtx);
```

#### Database query performance issues

**Symptoms**: Slow query responses or timeouts
**Cause**: Missing indexes or inefficient query patterns
**Solution**: Add appropriate indexes and optimize queries

```typescript
// ❌ Inefficient query
const campaigns = await ctx.db.query("campaigns").collect();
const userCampaigns = campaigns.filter((c) => c.userId === userId);

// ✅ Efficient query with index
const userCampaigns = await ctx.db
  .query("campaigns")
  .withIndex("by_user", (q) => q.eq("userId", userId))
  .collect();
```

### React/Next.js Issues

#### Hydration mismatches

**Symptoms**: Console warnings about hydration mismatches
**Cause**: Server and client rendering different content
**Solution**: Ensure consistent rendering or use client-only components

```typescript
// ❌ Server/client mismatch
function UserGreeting() {
  return <div>Hello, user {Math.random()}</div>;
}

// ✅ Client-only rendering
function UserGreeting() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return <div>Hello, user {Math.random()}</div>;
}
```

#### "Cannot read property of undefined" errors

**Symptoms**: Runtime errors accessing properties on undefined objects
**Cause**: Data not loaded or incorrect data structure assumptions
**Solution**: Add proper null checks and loading states

```typescript
// ❌ Unsafe property access
function CampaignCard({ campaign }) {
  return <div>{campaign.name}</div>;
}

// ✅ Safe property access
function CampaignCard({ campaign }) {
  if (!campaign) {
    return <div>Loading...</div>;
  }

  return <div>{campaign.name}</div>;
}
```

#### Hook dependency warnings

**Symptoms**: ESLint warnings about missing dependencies
**Cause**: useEffect or other hooks missing dependencies
**Solution**: Add missing dependencies or use useCallback/useMemo

```typescript
// ❌ Missing dependency
useEffect(() => {
  fetchCampaignData(campaignId);
}, []); // Missing campaignId dependency

// ✅ Include all dependencies
useEffect(() => {
  fetchCampaignData(campaignId);
}, [campaignId]);

// ✅ Use useCallback for stable function reference
const fetchData = useCallback(() => {
  fetchCampaignData(campaignId);
}, [campaignId]);

useEffect(() => {
  fetchData();
}, [fetchData]);
```

### Performance Issues

#### Slow page loads

**Symptoms**: Pages take a long time to load
**Cause**: Large bundle sizes, inefficient queries, or missing optimizations
**Solution**: Analyze bundle size and optimize critical paths

```bash
# Analyze bundle size
npm run build
npm run analyze

# Check for large dependencies
npx webpack-bundle-analyzer .next/static/chunks/*.js
```

**Optimization strategies**:

- Use dynamic imports for large components
- Implement proper caching strategies
- Optimize images and assets
- Use React.memo for expensive components

#### Memory leaks

**Symptoms**: Increasing memory usage over time
**Cause**: Event listeners not cleaned up, unclosed subscriptions
**Solution**: Proper cleanup in useEffect

```typescript
// ❌ Memory leak - no cleanup
useEffect(() => {
  const subscription = eventEmitter.on("data", handleData);
}, []);

// ✅ Proper cleanup
useEffect(() => {
  const subscription = eventEmitter.on("data", handleData);

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### Build and Deployment Issues

#### Build failures

**Symptoms**: Build process fails with various errors
**Cause**: Type errors, missing dependencies, or configuration issues
**Solution**: Check error messages and fix underlying issues

```bash
# Check for type errors
npm run type-check

# Check for linting errors
npm run lint

# Clean build cache
rm -rf .next
npm run build
```

#### Environment variable issues

**Symptoms**: Environment variables not available in application
**Cause**: Incorrect variable naming or missing configuration
**Solution**: Check environment variable configuration

```typescript
// ❌ Incorrect environment variable access
const apiUrl = process.env.API_URL; // Not available in client

// ✅ Correct Next.js environment variable
const apiUrl = process.env.NEXT_PUBLIC_API_URL; // Available in client
```

## Debugging Strategies

### Systematic Debugging Approach

1. **Reproduce the Issue**: Ensure you can consistently reproduce the problem
2. **Check the Console**: Look for error messages and warnings
3. **Use Debugger**: Set breakpoints and step through code
4. **Check Network Tab**: Monitor API calls and responses
5. **Verify Data Flow**: Trace data from source to display
6. **Test in Isolation**: Create minimal reproduction case

### Debugging Tools

#### Browser DevTools

- **Console**: Error messages and logging
- **Network**: API calls and performance
- **Sources**: Debugging with breakpoints
- **React DevTools**: Component state and props
- **Performance**: Profiling and optimization

#### Development Tools

```typescript
// Debug logging utility
const debug = {
  log: (message: string, data?: any) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEBUG] ${message}`, data);
    }
  },
  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${message}`, error);
  },
};

// Usage
debug.log("Campaign data loaded", campaignData);
```

#### Convex Dashboard

- Monitor query performance
- Check function logs
- Verify database state
- Test functions directly

### Performance Debugging

#### React Profiler

```typescript
// Wrap components to profile performance
import { Profiler } from 'react';

function onRenderCallback(id, phase, actualDuration) {
  console.log('Component render:', { id, phase, actualDuration });
}

function App() {
  return (
    <Profiler id="CampaignList" onRender={onRenderCallback}>
      <CampaignList />
    </Profiler>
  );
}
```

#### Performance Monitoring

```typescript
// Performance measurement utility
function measurePerformance<T>(name: string, fn: () => Promise<T>): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const start = performance.now();

    try {
      const result = await fn();
      const end = performance.now();
      console.log(`${name} took ${end - start} milliseconds`);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

// Usage
const campaigns = await measurePerformance("Load campaigns", () =>
  convex.query(api.campaigns.list)
);
```

## Error Handling Patterns

### Graceful Error Handling

```typescript
// Error boundary for React components
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

### Service Error Handling

```typescript
// Standardized error handling for services
class ServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

// Service with error handling
class CampaignService {
  async getCampaign(id: string): Promise<Campaign> {
    try {
      const campaign = await convex.query(api.campaigns.get, { id });

      if (!campaign) {
        throw new ServiceError(
          `Campaign not found: ${id}`,
          "CAMPAIGN_NOT_FOUND",
          404
        );
      }

      return campaign;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }

      throw new ServiceError("Failed to fetch campaign", "FETCH_ERROR", 500);
    }
  }
}
```

## Monitoring and Alerting

### Error Monitoring

```typescript
// Error reporting utility
interface ErrorReport {
  message: string;
  stack?: string;
  context: Record<string, any>;
  timestamp: Date;
  userId?: string;
}

function reportError(error: Error, context: Record<string, any> = {}) {
  const report: ErrorReport = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date(),
    userId: getCurrentUserId(),
  };

  // Send to error reporting service
  console.error("Error reported:", report);
}
```

### Performance Monitoring

```typescript
// Performance metrics collection
interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

function trackPerformance(
  name: string,
  duration: number,
  metadata?: Record<string, any>
) {
  const metric: PerformanceMetric = {
    name,
    duration,
    timestamp: new Date(),
    metadata,
  };

  // Send to monitoring service
  console.log("Performance metric:", metric);
}
```

## Getting Help

### Internal Resources

- [Analytics Troubleshooting](../../lib/services/analytics/troubleshooting.md)
- [Convex Limitations](./convex-limitations.md)
- [Authentication Guide](./authentication.md)
- [Billing Troubleshooting](../../lib/actions/billing/troubleshooting.md)

### External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Convex Documentation](https://docs.convex.dev)

### Team Communication

- **Slack**: #development channel for quick questions
- **GitHub Issues**: For bug reports and feature requests
- **Team Meetings**: Weekly sync for complex issues
- **Documentation**: Update this guide with new solutions

## Contributing to Troubleshooting

When you solve a new issue:

1. **Document the Solution**: Add it to this guide or relevant feature docs
2. **Include Context**: Explain the symptoms, cause, and solution
3. **Provide Examples**: Include code examples when helpful
4. **Cross-Reference**: Link to related documentation
5. **Test the Solution**: Ensure the solution works reliably

This helps build institutional knowledge and prevents others from encountering the same issues.
