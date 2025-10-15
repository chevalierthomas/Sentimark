import { createRouter, createWebHistory } from 'vue-router';
import WelcomeView from '../views/WelcomeView.vue';
import LoginView from '../views/LoginView.vue';
import CompanyDetailView from '../views/CompanyDetailView.vue';
import { useAuth } from '../stores/auth';

const routes = [
  {
    path: '/',
    name: 'welcome',
    component: WelcomeView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/companies/:symbol',
    name: 'company-detail',
    component: CompanyDetailView,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to) => {
  const auth = useAuth();

  if (to.meta.requiresAuth && !auth.isAuthenticated.value) {
    return {
      name: 'login',
      query: { redirect: to.fullPath }
    };
  }

  if (to.name === 'login' && auth.isAuthenticated.value) {
    const redirect = typeof to.query.redirect === 'string' ? to.query.redirect : null;
    return redirect ? { path: redirect } : { path: '/' };
  }

  return true;
});

export default router;
