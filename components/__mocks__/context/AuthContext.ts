// Mock for AuthContext
import { useAuth as useAuthOriginal } from '@/context/AuthContext';

// Mock implementation
export const useAuth = () => ({
  user: {
    id: '1',
    displayName: 'Test User',
    email: 'test@example.com',
    claims: { role: 'admin' },
    profile: { avatar: null }
  },
  signIn: () => {},
  signOut: () => {},
  isLoading: false,
});

// Re-export the original for cases where it's not being mocked
export { useAuthOriginal };
