import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../pages/LoginPage.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../pages/RegisterPage.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../pages/DashboardPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/builder/:id?',
    name: 'builder',
    component: () => import('../pages/BuilderPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/forms/:id/analytics',
    name: 'form-analytics',
    component: () => import('../pages/FormAnalyticsPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/forms/:id/submissions',
    name: 'form-submissions',
    component: () => import('../pages/SubmissionsPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/f/:id',
    name: 'form-public',
    component: () => import('../pages/FormPublicPage.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../pages/NotFoundPage.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
