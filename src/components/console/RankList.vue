<script setup lang="ts">
import { computed } from 'vue'

/**
 * 排行条目列表。条形是「背景填充」而不是独立的进度条 —— 名称直接压在
 * 条形上，同样的高度里能多放两三行，这是密集看板省空间的常用手法。
 */
export interface RankItem {
  label: string
  value: number
  /** 品牌色圆点，没有就不渲染 */
  color?: string
}

const props = defineProps<{
  items: RankItem[]
  format: (value: number) => string
  emptyHint?: string
}>()

const ceiling = computed(() => Math.max(...props.items.map((item) => item.value), 1))
</script>

<template>
  <div v-if="items.length" class="space-y-1">
    <div
      v-for="item in items"
      :key="item.label"
      class="relative flex h-9 items-center gap-2 overflow-hidden rounded-md px-2.5 text-sm"
    >
      <div
        class="absolute inset-y-0 left-0 rounded-md bg-accent transition-[width] duration-300"
        :style="{ width: `${(item.value / ceiling) * 100}%` }"
      />
      <span
        v-if="item.color"
        class="relative size-2 shrink-0 rounded-full"
        :style="{ backgroundColor: item.color }"
      />
      <span class="relative min-w-0 truncate">{{ item.label }}</span>
      <span class="tabular relative ml-auto shrink-0 text-muted-foreground">
        {{ format(item.value) }}
      </span>
    </div>
  </div>

  <p v-else class="py-8 text-center text-sm text-muted-foreground">
    {{ emptyHint ?? '本周期内没有数据' }}
  </p>
</template>
