import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export function useRequireAuth() {
  const { isAuthenticated, isLoading, fetchUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      fetchUser().catch(() => router.push('/login'));
    }
  }, [isAuthenticated, isLoading, fetchUser, router]);

  return { isAuthenticated, isLoading };
}
