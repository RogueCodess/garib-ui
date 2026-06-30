import { createRouter, createWebHistory } from 'vue-router'
import { frappeRequest } from 'frappe-ui'

const routes = [
  { path: '/', redirect: '/garib/items' },
  { path: '/garib', redirect: '/garib/items' },
  { path: '/garib/items', component: () => import('@/pages/ItemsPage.vue') },
  { path: '/garib/items/:itemCode', component: () => import('@/pages/ItemDetailPage.vue') },
  { path: '/garib/stock', component: () => import('@/pages/StockPage.vue') },
  { path: '/garib/serials', component: () => import('@/pages/SerialLookupPage.vue') },
  { path: '/garib/receive', component: () => import('@/pages/ReceiveStockPage.vue') },
  { path: '/garib/claims', component: () => import('@/pages/ClaimsPage.vue') },
  { path: '/garib/claims/:claimName', component: () => import('@/pages/ClaimDetailPage.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Auth guard: redirect to Frappe login if not logged in
router.beforeEach(async (to, from, next) => {
  try {
    const user = await frappeRequest({ url: '/api/method/frappe.auth.get_logged_user' })
    if (!user) {
      window.location.href = '/login?redirect-to=/garib'
      return
    }
    next()
  } catch {
    window.location.href = '/login?redirect-to=/garib'
  }
})

export default router
