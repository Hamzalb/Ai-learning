import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export function useRequireAuth() {
  const { isAuthenticated, isLoading, fetchUser, token } = useAuthStore();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  // Wait for Zustand persist to hydrate from localStorage before checking auth.
  useEffect(() => { setHydrated(true); }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated && !isLoading && !token) {
      fetchUser().catch(() => router.push('/login'));
    }
  }, [hydrated, isAuthenticated, isLoading, token, fetchUser, router]);

  return { isAuthenticated, isLoading, hydrated };
}
