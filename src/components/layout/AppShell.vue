<script setup lang="ts">
import { useStorage } from '@vueuse/core'

import AppSidebar from './AppSidebar.vue'
import AppTopNav from './AppTopNav.vue'

/** 折叠状态持久化：刷新后布局不回弹，是控制台类产品的基本体感 */
const collapsed = useStorage('closerouter-sidebar-collapsed', false)
</script>

<template>
  <div class="flex h-screen flex-col overflow-hidden bg-background text-foreground">
    <AppTopNav />

    <div class="flex min-h-0 flex-1">
      <AppSidebar :collapsed="collapsed" @toggle="collapsed = !collapsed" />

      <!-- 内容区齐边通栏，不做 max-width 居中：控制台的表格越宽越好用，
           居中容器在 2K 屏上会白白浪费两侧空间。留白只由 px-5 控制。 -->
      <main class="min-w-0 flex-1 overflow-y-auto scrollbar-subtle">
        <div class="px-5 py-6">
          <RouterView v-slot="{ Component }">
            <component :is="Component" />
          </RouterView>
        </div>
      </main>
    </div>
  </div>
</template>
