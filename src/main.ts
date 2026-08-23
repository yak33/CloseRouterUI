import '@fontsource-variable/outfit'
import '@fontsource-variable/plus-jakarta-sans'
import '@fontsource-variable/geist-mono'
import '@/assets/styles/index.css'

import { createApp } from 'vue'

import App from './App.vue'
import { router } from './router'

createApp(App).use(router).mount('#app')
