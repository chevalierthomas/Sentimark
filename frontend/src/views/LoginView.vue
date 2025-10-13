<template>
  <section class="login">
    <div class="card">
      <h2>Sign in to Sentimark</h2>
      <p class="subtitle">Securely access your personalized sentiment dashboards.</p>
      <form @submit.prevent="onSubmit">
        <label for="email">Email address</label>
        <input id="email" v-model="form.email" type="email" required autocomplete="email" />

        <label for="password">Password</label>
        <div class="password-wrapper">
          <input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            minlength="8"
            required
            autocomplete="current-password"
          />
          <button type="button" class="toggle" @click="showPassword = !showPassword">
            {{ showPassword ? 'Hide' : 'Show' }}
          </button>
        </div>

        <label class="remember">
          <input v-model="form.remember" type="checkbox" />
          Keep me signed in on this device
        </label>

        <button type="submit" class="submit" :disabled="loading">
          {{ loading ? 'Signing in...' : 'Sign in' }}
        </button>

        <p v-if="error" class="error">{{ error }}</p>
        <p v-if="success" class="success">{{ success }}</p>
      </form>
    </div>
    <aside class="aside">
      <h3>Security you can trust</h3>
      <ul>
        <li>End-to-end encrypted API communication powered by Axios.</li>
        <li>JWT-based authentication with rotating refresh tokens.</li>
        <li>Role-based access control for team collaboration.</li>
      </ul>
    </aside>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { login } from '../api/auth';

const form = reactive({
  email: '',
  password: '',
  remember: false
});

const showPassword = ref(false);
const loading = ref(false);
const error = ref('');
const success = ref('');

const onSubmit = async () => {
  error.value = '';
  success.value = '';
  loading.value = true;
  try {
    const payload = await login({
      email: form.email,
      password: form.password,
      remember: form.remember
    });
    success.value = `Welcome back, ${payload.user.name}!`;
  } catch (err) {
    error.value = err.response?.data?.message ?? 'Unable to sign in with those credentials.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 3rem;
  align-items: start;
}

.card {
  background: #ffffff;
  padding: 3rem;
  border-radius: 2rem;
  box-shadow: 0 25px 45px rgba(15, 23, 42, 0.12);
  border: 1px solid rgba(226, 232, 240, 0.6);
}

.card h2 {
  margin: 0;
  font-size: 2rem;
  color: #0f172a;
}

.subtitle {
  margin: 0.75rem 0 2.5rem;
  color: #475569;
}

form {
  display: grid;
  gap: 1.25rem;
}

label {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.9rem;
}

input[type='email'],
input[type='password'],
input[type='text'] {
  width: 100%;
  padding: 0.85rem 1rem;
  border-radius: 0.85rem;
  border: 1px solid rgba(148, 163, 184, 0.6);
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.18);
}

.password-wrapper {
  position: relative;
}

.toggle {
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  border: none;
  background: none;
  font-weight: 600;
  color: #6366f1;
  cursor: pointer;
}

.remember {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  font-size: 0.85rem;
  color: #475569;
}

.submit {
  padding: 0.9rem 1.5rem;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.submit:hover {
  transform: translateY(-1px);
  box-shadow: 0 15px 30px rgba(99, 102, 241, 0.35);
}

.submit:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.error {
  color: #dc2626;
  margin: 0;
}

.success {
  color: #0f766e;
  margin: 0;
}

.aside {
  background: linear-gradient(135deg, rgba(15, 118, 110, 0.95), rgba(13, 148, 136, 0.85));
  color: #ecfeff;
  padding: 3rem;
  border-radius: 2rem;
  box-shadow: 0 25px 45px rgba(15, 23, 42, 0.12);
}

.aside h3 {
  margin-top: 0;
  font-size: 1.5rem;
}

.aside ul {
  margin: 2rem 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 1.5rem;
}

.aside li {
  font-size: 1.05rem;
}

@media (max-width: 1024px) {
  .login {
    grid-template-columns: 1fr;
  }
}
</style>
