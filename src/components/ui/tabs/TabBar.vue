<script setup lang="ts">
import { TabsList, TabsRoot, TabsTrigger } from 'reka-ui'

import type { TabItem } from '.'

/**
 * 下划线式标签栏。
 *
 * 选中态是 primary 文字 + primary 下划线，而不是「胶囊底色」——
 * 页面级切换要轻，胶囊那种重量级选中态留给同一区块内的视图切换。
 *
 * 走 Reka 的 Tabs 而不是裸 button：方向键导航、roving tabindex、
 * aria 关系都是白送的，自己实现容易漏掉键盘可达性。
 */
const model = defineModel<string>({ required: true })

defineProps<{ items: TabItem[] }>()
</script>

<template>
  <TabsRoot v-model="model">
    <TabsList class="flex items-center gap-6 overflow-x-auto border-b border-border scrollbar-subtle">
      <TabsTrigger
        v-for="item in items"
        :key="item.value"
        :value="item.value"
        class="relative -mb-px flex shrink-0 items-center gap-1.5 border-b-2 border-transparent pb-3 text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:text-foreground data-[state=active]:border-primary data-[state=active]:font-medium data-[state=active]:text-primary"
      >
        {{ item.label }}
        <span v-if="item.count !== undefined" class="tabular text-xs text-muted-foreground">
          {{ item.count }}
        </span>
      </TabsTrigger>
    </TabsList>
  </TabsRoot>
</template>
