import * as SecureStore from 'expo-secure-store';
import type { AuthRole } from './api/client';

export const TOKEN_KEY = 'auth_token';
export const ROLE_KEY = 'auth_role';
export const EMAIL_KEY = 'auth_email';

export async function getStoredAuthToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function persistAuthSession(token: string, role: AuthRole, email: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await SecureStore.setItemAsync(ROLE_KEY, role);
  await SecureStore.setItemAsync(EMAIL_KEY, email);
}

export async function clearAuthSession() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(ROLE_KEY);
  await SecureStore.deleteItemAsync(EMAIL_KEY);
}

export async function loadAuthSession() {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  const role = (await SecureStore.getItemAsync(ROLE_KEY)) as AuthRole | null;
  const email = await SecureStore.getItemAsync(EMAIL_KEY);
  if (token && role) return { token, role, email };
  return null;
}
