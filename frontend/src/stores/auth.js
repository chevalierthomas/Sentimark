import { computed, reactive } from 'vue';
import client from '../api/client';

const STORAGE_KEY = 'sentimark.auth';

const state = reactive({
  user: null,
  tokens: null
});

function setAuthorizationHeader(token) {
  if (token) {
    client.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete client.defaults.headers.common.Authorization;
  }
}

function loadSession() {
  if (typeof window === 'undefined') {
    return;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    state.user = parsed.user ?? null;
    state.tokens = parsed.tokens ?? null;
    if (parsed.tokens?.accessToken) {
      setAuthorizationHeader(parsed.tokens.accessToken);
    }
  } catch (error) {
    console.warn('Failed to parse stored auth session', error);
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

function persistSession() {
  if (typeof window === 'undefined') {
    return;
  }

  if (!state.user || !state.tokens) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      user: state.user,
      tokens: state.tokens
    })
  );
}

loadSession();

export function useAuth() {
  const isAuthenticated = computed(() => Boolean(state.tokens?.accessToken));

  const login = (user, tokens) => {
    state.user = user;
    state.tokens = tokens;
    setAuthorizationHeader(tokens?.accessToken);
    persistSession();
  };

  const logout = () => {
    state.user = null;
    state.tokens = null;
    setAuthorizationHeader();
    persistSession();
  };

  return {
    user: computed(() => state.user),
    tokens: computed(() => state.tokens),
    isAuthenticated,
    login,
    logout
  };
}
