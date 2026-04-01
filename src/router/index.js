import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import SettingsView from '../views/SettingsView.vue'
import FiltersView from '../views/FiltersView.vue'
import { useAuthStore } from '../stores/auth.js'

const routes = [
  { path: '/', name: 'login', component: LoginView },
  { path: '/dashboard', name: 'dashboard', component: DashboardView, meta: { requiresAuth: true } },
  { path: '/settings', name: 'settings', component: SettingsView, meta: { requiresAuth: true } },
  { path: '/filters', name: 'filters', component: FiltersView, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  // Wait for Firebase to finish restoring session before checking auth
  await auth.ready
  if (to.meta.requiresAuth && !auth.user) {
    return { name: 'login' }
  }
  if (to.name === 'login' && auth.user) {
    return { name: 'dashboard' }
  }
})

export default router
