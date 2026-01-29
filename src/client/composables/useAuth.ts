import { useAuthStore } from '../stores/auth.store.js';
import { useRouter } from 'vue-router';

export function useAuth() {
  const store = useAuthStore();
  const router = useRouter();

  async function handleLogin(email: string, password: string): Promise<void> {
    await store.login(email, password);
    router.push('/dashboard');
  }

  async function handleRegister(
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
  ): Promise<void> {
    await store.register(email, password, firstName, lastName);
    router.push('/dashboard');
  }

  async function handleLogout(): Promise<void> {
    await store.logout();
    router.push('/login');
  }

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    fullName: store.fullName,
    handleLogin,
    handleRegister,
    handleLogout,
    clearError: store.clearError,
    fetchUser: store.fetchUser,
  };
}
