<template>
  <aside class="w-56 shrink-0 bg-white border-r border-gray-100 flex flex-col h-screen">
    <!-- Brand -->
    <div class="px-5 py-5 border-b border-gray-100">
      <p class="text-xs text-gray-400 font-medium tracking-wider uppercase">Garib Appliances</p>
      <p class="text-sm font-semibold text-gray-800 mt-0.5">Back Office</p>
    </div>

    <!-- Nav -->
    <nav class="flex-1 px-3 py-4 space-y-0.5">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        active-class="bg-blue-50 text-blue-700 font-medium"
      >
        <span class="text-base">{{ item.icon }}</span>
        {{ item.label }}
      </RouterLink>
    </nav>

    <!-- User -->
    <div class="px-4 py-4 border-t border-gray-100">
      <p class="text-xs text-gray-500 truncate">{{ currentUser }}</p>
      <a
        href="/logout"
        class="text-xs text-gray-400 hover:text-gray-600 mt-0.5 block"
      >
        Sign out
      </a>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { frappeRequest } from 'frappe-ui'

const navItems = [
  { path: '/items',   icon: '📦', label: 'Items' },
  { path: '/stock',   icon: '🏪', label: 'Stock' },
  { path: '/serials', icon: '🔍', label: 'Serials' },
  { path: '/receive', icon: '📥', label: 'Receive' },
  { path: '/claims',  icon: '🔧', label: 'Warranty' },
]

const currentUser = ref('')
onMounted(async () => {
  try {
    const user = await frappeRequest({ url: '/api/method/frappe.auth.get_logged_user' })
    currentUser.value = user
  } catch {}
})
</script>
