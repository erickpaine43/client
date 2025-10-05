# 🔧 Next.js SSR Compatibility Guide - Analytics Systems

## 📋 **Issue Summary**

**Problem:** `ReferenceError: window is not defined` errors during Next.js production builds when using analytics systems.

**Impact:** Production builds fail, preventing deployment of applications with analytics functionality.

**Root Cause:** Browser-specific APIs (like `window`, `setInterval`, etc.) are accessed during server-side rendering (SSR) build phase.

---

## 🔍 **Root Cause Analysis**

### **Primary Causes**

1. **Browser API Access During SSR**
   - Analytics services initialized at module level
   - `setInterval()` calls in constructors
   - Direct `window` object access
   - Browser-specific event listeners

2. **Module-Level Instantiation**
   - Singleton services instantiated on import
   - Global state initialization
   - Side effects in module scope

3. **Component Tree Dependencies**
   - Analytics providers rendered during SSR
   - Context consumers in server-rendered components
   - Layout components with analytics dependencies

### **Error Patterns**

```bash
ReferenceError: window is not defined
    at n (.next/server/chunks/8914.js:1:43229)
```

```bash
Error: setInterval is not defined
    at AnalyticsMonitor.constructor
```

---

## 🛠️ **Remediation Strategies**

### **Strategy 1: Dynamic Imports with SSR Disabled**

#### **Implementation:**
```typescript
// components/analytics/ClientAnalyticsProvider.tsx
"use client";
import dynamic from "next/dynamic";

const AnalyticsProvider = dynamic(
  () => import("@/context/AnalyticsContext").then(mod => ({ default: mod.AnalyticsProvider })),
  {
    ssr: false,
    loading: () => null
  }
);

export function ClientAnalyticsProvider({ children }: { children: React.ReactNode }) {
  return <AnalyticsProvider>{children}</AnalyticsProvider>;
}
```

#### **Usage:**
```typescript
// app/layout.tsx
import { ClientAnalyticsProvider } from "@/components/analytics/ClientAnalyticsProvider";

<ClientAnalyticsProvider>
  {children}
</ClientAnalyticsProvider>
```

### **Strategy 2: Lazy Service Initialization**

#### **Implementation:**
```typescript
// lib/services/analytics/AnalyticsService/index.ts
export const analyticsService = (() => {
  if (typeof window === 'undefined') {
    // Return proxy during SSR
    return new Proxy({}, {
      get: () => () => Promise.resolve(null)
    }) as any;
  }

  // Normal initialization for client-side
  if (!analyticsServiceInstance) {
    analyticsServiceInstance = AnalyticsService.getInstance();
  }
  return analyticsServiceInstance;
})();
```

### **Strategy 3: Conditional Component Logic**

#### **Implementation:**
```typescript
// components/analytics/AnalyticsComponent.tsx
"use client";
import { useAnalytics } from "@/context/AnalyticsContext";

function AnalyticsComponent() {
  const { fetchData } = useAnalytics();

  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip during SSR

    const loadData = async () => {
      await fetchData();
    };
    loadData();
  }, [fetchData]);

  return <div>Analytics Content</div>;
}
```

### **Strategy 4: Page-Level Dynamic Rendering**

#### **Implementation:**
```typescript
// app/analytics/page.tsx
"use client";
import nextDynamic from "next/dynamic";

const AnalyticsPageContent = nextDynamic(
  () => import("./AnalyticsPageContent"),
  { ssr: false, loading: () => <div>Loading...</div> }
);

export default function Page() {
  return <AnalyticsPageContent />;
}
```

### **Strategy 5: Force Dynamic Rendering**

#### **Implementation:**
```typescript
// Force page to be server-rendered instead of statically generated
export const dynamic = 'force-dynamic';
```

---

## ⚠️ **Pitfalls to Avoid**

### **❌ Common Mistakes**

1. **Using `ssr: false` in Server Components**
   ```typescript
   // ❌ WRONG - Server Component
   import dynamic from "next/dynamic";
   const Component = dynamic(() => import("./Component"), { ssr: false }); // ERROR

   // ✅ CORRECT - Client Component
   "use client";
   import dynamic from "next/dynamic";
   const Component = dynamic(() => import("./Component"), { ssr: false });
   ```

2. **Module-Level Browser API Access**
   ```typescript
   // ❌ WRONG
   const analytics = new AnalyticsService(); // Constructor uses window
   export default analytics;

   // ✅ CORRECT
   let instance;
   export const getAnalytics = () => {
     if (typeof window === 'undefined') return null;
     return instance ||= new AnalyticsService();
   };
   ```

3. **Incorrect Dynamic Import Naming**
   ```typescript
   // ❌ WRONG - Conflicts with Next.js export
   import dynamic from "next/dynamic";
   export const dynamic = 'force-dynamic'; // TypeScript error

   // ✅ CORRECT - Use alias
   import nextDynamic from "next/dynamic";
   export const dynamic = 'force-dynamic';
   ```

4. **Analytics Calls in useEffect Without SSR Checks**
   ```typescript
   // ❌ WRONG
   useEffect(() => {
     analytics.trackPageView(); // Runs during SSR
   }, []);

   // ✅ CORRECT
   useEffect(() => {
     if (typeof window === 'undefined') return;
     analytics.trackPageView();
   }, []);
   ```

5. **Singleton Patterns with Browser Dependencies**
   ```typescript
   // ❌ WRONG
   class AnalyticsMonitor {
     constructor() {
       setInterval(() => {}, 1000); // Runs during SSR
     }
   }

   // ✅ CORRECT
   class AnalyticsMonitor {
     constructor() {
       if (typeof window !== 'undefined') {
         setInterval(() => {}, 1000);
       }
     }
   }
   ```

### **❌ Anti-Patterns**

1. **Conditional Imports (Don't Work)**
   ```typescript
   // ❌ DOESN'T WORK - Import happens at build time
   if (typeof window !== 'undefined') {
     const analytics = require('./analytics');
   }
   ```

2. **Runtime Environment Checks in Module Scope**
   ```typescript
   // ❌ PROBLEMATIC - Still executes during build
   const isBrowser = typeof window !== 'undefined';
   const analytics = isBrowser ? new AnalyticsService() : null;
   ```

3. **Wrapper Components Without Dynamic Imports**
   ```typescript
   // ❌ DOESN'T PREVENT SSR
   function AnalyticsWrapper({ children }) {
     if (typeof window === 'undefined') return children;
     return <AnalyticsProvider>{children}</AnalyticsProvider>;
   }
   ```

---

## 🧪 **Things We Tried That Didn't Work**

### **1. Conditional Service Initialization (Partial Success)**

**Attempted:**
```typescript
// lib/services/analytics/index.ts
export const analyticsService = typeof window === 'undefined'
  ? null
  : AnalyticsService.getInstance();
```

**Problem:** Components still tried to call methods on `null`, causing runtime errors.

**Solution:** Used proxy objects instead of `null` returns.

### **2. Environment-Based Module Loading (Failed)**

**Attempted:**
```typescript
// Dynamic require based on environment
const analytics = process.env.NODE_ENV === 'production'
  ? require('./analytics.prod')
  : require('./analytics.dev');
```

**Problem:** Next.js bundler still includes both modules, and SSR still executes browser code.

**Solution:** Used lazy initialization with runtime checks.

### **3. Build-Time Code Splitting (Partial Success)**

**Attempted:**
```typescript
// webpackChunkName in dynamic imports
const AnalyticsProvider = dynamic(
  () => import(/* webpackChunkName: "analytics" */ "./AnalyticsProvider"),
  { ssr: false }
);
```

**Problem:** Still had SSR execution issues with indirect dependencies.

**Solution:** Combined with proxy objects and conditional logic.

### **4. Global Window Checks (Insufficient)**

**Attempted:**
```typescript
// In every analytics method
if (typeof window === 'undefined') return;

// OR

// Global utility
export const isBrowser = () => typeof window !== 'undefined';
```

**Problem:** Constructor-level browser API calls (like `setInterval`) still executed during module loading.

**Solution:** Moved all browser APIs to lazy initialization methods.

### **5. Next.js Runtime Config (Not Applicable)**

**Attempted:**
```typescript
// next.config.js
module.exports = {
  experimental: {
    runtime: 'nodejs', // or 'edge'
  }
}
```

**Problem:** Doesn't prevent SSR issues, just changes runtime environment.

**Solution:** Focused on component-level and service-level fixes.

---

## 📋 **Diagnostic Checklist**

### **Step 1: Identify the Error Source**

```bash
# Run build to see error
npm run build

# Check the error stack trace
# Look for chunks like: .next/server/chunks/8914.js
# Find the line number causing the issue
```

### **Step 2: Trace Import Dependencies**

```typescript
// Use this script to trace imports
// Add to any suspected file:
console.log('File loaded:', __filename);
console.log('Window available:', typeof window !== 'undefined');

// Run build and check console output
```

### **Step 3: Check Module Loading Order**

```bash
# Check bundle analyzer
npm install --save-dev @next/bundle-analyzer

# In next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

// Run with analysis
ANALYZE=true npm run build
```

### **Step 4: Verify Service Initialization**

```typescript
// Add debugging to services
class AnalyticsService {
  constructor() {
    console.log('AnalyticsService constructor called');
    console.log('Is browser:', typeof window !== 'undefined');
  }
}
```

---

## 🚀 **Complete Implementation Example**

### **File Structure:**
```
components/
├── analytics/
│   ├── AnalyticsProviderClient.tsx
│   └── ClientAnalyticsProvider.tsx
lib/
├── services/
│   └── analytics/
│       ├── AnalyticsService/
│       │   └── index.ts
│       └── monitoring/
│           └── AnalyticsMonitor.ts
context/
└── AnalyticsContext.tsx
```

### **Key Files:**

#### **ClientAnalyticsProvider.tsx**
```typescript
"use client";
import dynamic from "next/dynamic";

const AnalyticsProvider = dynamic(
  () => import("@/context/AnalyticsContext").then(mod => ({ default: mod.AnalyticsProvider })),
  {
    ssr: false,
    loading: () => null
  }
);

export function ClientAnalyticsProvider({ children }: { children: React.ReactNode }) {
  return <AnalyticsProvider>{children}</AnalyticsProvider>;
}
```

#### **AnalyticsService/index.ts**
```typescript
export const analyticsService = (() => {
  if (typeof window === 'undefined') {
    return new Proxy({}, {
      get: () => () => Promise.resolve(null)
    }) as any;
  }

  if (!analyticsServiceInstance) {
    analyticsServiceInstance = AnalyticsService.getInstance();
  }
  return analyticsServiceInstance;
})();
```

#### **AnalyticsMonitor.ts**
```typescript
static getInstance(): AnalyticsMonitor {
  if (typeof window === 'undefined') {
    return new Proxy({}, {
      get: () => () => {}
    }) as any;
  }

  if (!this.instance) {
    this.instance = new AnalyticsMonitor();
  }
  return this.instance;
}
```

#### **Layout Usage**
```typescript
// app/dashboard/layout.tsx
import { ClientAnalyticsProvider } from "@/components/analytics/ClientAnalyticsProvider";

<ClientAnalyticsProvider>
  <SidebarProvider>
    {/* ... */}
  </SidebarProvider>
</ClientAnalyticsProvider>
```

---

## 📊 **Success Metrics**

- ✅ Build processes 50+ pages successfully
- ✅ Analytics pages render without SSR errors
- ✅ Development mode works perfectly
- ✅ Production builds can complete
- ✅ Client-side analytics functionality preserved

## 🔄 **Testing Strategy**

### **Build Testing:**
```bash
# Test production build
npm run build

# Test with different Node versions
nvm use 18 && npm run build
nvm use 20 && npm run build
```

### **Runtime Testing:**
```bash
# Test development mode
npm run dev

# Test analytics functionality
npm run test:analytics
```

### **SSR Testing:**
```typescript
// Add to any page to test SSR
export default function Page() {
  console.log('SSR check:', typeof window);
  return <div>Test</div>;
}
```

---

## 📞 **Support Notes**

- **Priority:** High - Blocks production deployments
- **Scope:** Analytics system SSR compatibility
- **Impact:** Affects all pages using analytics
- **Testing:** Requires full build testing

## 🎯 **Prevention Guidelines**

1. **Always use dynamic imports for browser-dependent components**
2. **Implement lazy service initialization with SSR checks**
3. **Use proxy objects instead of null returns**
4. **Add SSR checks in useEffect hooks**
5. **Test builds regularly during development**

---

*Last Updated: 2025-10-03*
*Version: 1.0*
*Author: Roo (Software Engineer)*
