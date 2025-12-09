// Mock for Next.js navigation hooks
export const usePathname = () => '/dashboard';

export const useRouter = () => ({
  push: () => {},
  replace: () => {},
  refresh: () => {},
  back: () => {},
  forward: () => {},
  prefetch: () => {},
});

export const useSearchParams = () => ({
  get: () => null,
});

export const useParams = () => ({});

// Mock Link component for Storybook
import React from 'react';

export const Link = ({ children, href, className, ...props }: any) => {
  return React.createElement('a', { href, className, ...props }, children);
};

// Default export for compatibility
const navigation = {
  usePathname,
  useRouter,
  useSearchParams,
  useParams,
  Link,
};

export default navigation;
