<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

/**
 * 页面头：大标题在左，操作簇在右。
 * 标题下沉到内容区（而不是放在全局顶栏）是参考实现的做法 —— 顶栏留给
 * 跨页面的产品级导航，页面身份由内容区自己声明。
 */
const props = defineProps<{
  title: string
  description?: string
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <header :class="cn('flex flex-wrap items-start justify-between gap-3', props.class)">
    <div class="min-w-0">
      <h1 class="font-brand text-[28px] font-bold leading-tight tracking-tight">{{ title }}</h1>
      <p v-if="description" class="mt-1 text-sm text-muted-foreground">{{ description }}</p>
    </div>

    <div class="flex shrink-0 items-center gap-2">
      <slot name="actions" />
    </div>
  </header>
</template>
