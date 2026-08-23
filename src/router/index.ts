import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import ActivityView from '@/views/ActivityView.vue'

/**
 * meta.title 由 Topbar 直接消费，新增路由时别忘了写 —— 缺失会回落成 "Console"。
 *
 * @author ZHANGCHAO
 * @date 2026/08/22
 */
const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/activity' },
  {
    path: '/activity',
    name: 'activity',
    component: ActivityView,
    meta: { title: 'Activity' },
  },
  {
    path: '/models',
    name: 'models',
    component: () => import('@/views/ModelsView.vue'),
    meta: { title: 'Models' },
  },
  {
    path: '/chat',
    name: 'chat',
    component: () => import('@/views/ChatView.vue'),
    meta: { title: 'Chat' },
  },
  {
    path: '/logs',
    name: 'logs',
    component: () => import('@/views/LogsView.vue'),
    meta: { title: 'Logs' },
  },
  {
    path: '/keys',
    name: 'keys',
    component: () => import('@/views/KeysView.vue'),
    meta: { title: 'API Keys' },
  },
  {
    path: '/credits',
    name: 'credits',
    component: () => import('@/views/CreditsView.vue'),
    meta: { title: 'Credits' },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { title: 'Settings' },
  },
  { path: '/:pathMatch(.*)*', redirect: '/activity' },
]

export const router = createRouter({
  // 必须传 BASE_URL：部署到 GitHub Pages 这类子路径时，缺了它所有路由都会 404
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})
