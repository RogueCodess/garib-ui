import { createRouter, createWebHistory } from 'vue-router'
import { frappeRequest } from 'frappe-ui'

const routes = [
  { path: '/', redirect: '/items' },
  { path: '/items', component: () => import('@/pages/ItemsPage.vue') },
  { path: '/items/:itemCode', component: () => import('@/pages/ItemDetailPage.vue') },
  { path: '/stock', component: () => import('@/pages/StockPage.vue') },
  { path: '/serials', component: () => import('@/pages/SerialLookupPage.vue') },
  { path: '/receive', component: () => import('@/pages/ReceiveStockPage.vue') },
  { path: '/claims', component: () => import('@/pages/ClaimsPage.vue') },
  { path: '/claims/:claimName', component: () => import('@/pages/ClaimDetailPage.vue') },
]

const router = createRouter({
  history: createWebHistory('/garib/'),
  routes,
})

// Module-level auth cache — avoids a round-trip on every navigation
export let cachedUser = null

// Auth guard: redirect to Frappe login if not logged in
router.beforeEach(async () => {
  if (cachedUser) return // already authenticated this session
  try {
    const user = await frappeRequest({ url: '/api/method/frappe.auth.get_logged_user' })
    if (!user || user === 'Guest') {
      window.location.href = '/login?redirect-to=/garib/'
      return false
    }
    cachedUser = user
    return true
  } catch (e) {
    console.error('Auth check failed:', e)
    window.location.href = '/login?redirect-to=/garib/'
    return false
  }
})

export default router
