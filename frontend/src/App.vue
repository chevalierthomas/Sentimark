<template>
  <div class="app-shell">
    <header class="app-header">
      <h1>Sentimark</h1>
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink v-if="!isAuthenticated" to="/login">Login</RouterLink>
        <div v-else class="user-menu">
          <span class="user-name">{{ userName }}</span>
          <button type="button" class="logout" @click="onLogout">Logout</button>
        </div>
      </nav>
    </header>
    <main class="app-main">
      <RouterView />
    </main>
    <footer class="app-footer">
      <small>&copy; {{ currentYear }} Sentimark. All rights reserved.</small>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { RouterLink, RouterView, useRouter } from 'vue-router';
import { useAuth } from './stores/auth';

const currentYear = computed(() => new Date().getFullYear());
const auth = useAuth();
const router = useRouter();

const isAuthenticated = computed(() => auth.isAuthenticated.value);
const userName = computed(() => auth.user.value?.name ?? 'Analyst');

const onLogout = () => {
  auth.logout();
  router.push('/');
};
</script>

<style scoped>
.app-shell {
  display: grid;
  min-height: 100vh;
  grid-template-rows: auto 1fr auto;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 3rem;
  background: linear-gradient(120deg, #1e293b, #334155);
  color: #f8fafc;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.25);
}

.app-header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

nav {
  display: flex;
  gap: 1rem;
  align-items: center;
}

nav a {
  color: #f8fafc;
  font-weight: 600;
  transition: opacity 0.2s ease;
}

nav a.router-link-exact-active {
  opacity: 0.6;
}

.user-menu {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}

.user-name {
  font-weight: 600;
  color: rgba(226, 232, 240, 0.9);
}

.logout {
  border: 1px solid rgba(226, 232, 240, 0.35);
  border-radius: 999px;
  padding: 0.35rem 0.9rem;
  background: transparent;
  color: #f8fafc;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.logout:hover {
  background: rgba(248, 250, 252, 0.15);
  color: #e0e7ff;
}

.app-main {
  padding: 2rem 3rem;
}

.app-footer {
  text-align: center;
  padding: 1.5rem;
  background: #e2e8f0;
  color: #334155;
}
</style>
