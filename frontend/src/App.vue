<template>
  <div class="app-shell">
    <header class="app-header">
      <h1>Sentimark</h1>
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/login">Login</RouterLink>
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
import { RouterLink, RouterView } from 'vue-router';
import { computed } from 'vue';

const currentYear = computed(() => new Date().getFullYear());
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
}

nav a {
  color: #f8fafc;
  font-weight: 600;
  transition: opacity 0.2s ease;
}

nav a.router-link-exact-active {
  opacity: 0.6;
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
