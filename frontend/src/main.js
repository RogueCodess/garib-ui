import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { setConfig, frappeRequest, FrappeUI } from 'frappe-ui'
import App from './App.vue'
import router from './router'
import './index.css'

setConfig('resourceFetchFn', frappeRequest)

const app = createApp(App)
app.use(createPinia())
app.use(FrappeUI)
app.use(router)
app.mount('#app')
