<script setup lang="ts">
import { computed } from 'vue'

/**
 * 请求量直方图。柱子之间留固定 gap，柱宽由容器均分 —— 桶数变化时
 * 不需要改任何参数，视觉密度自适应。
 */
const props = withDefaults(
  defineProps<{
    values: number[]
    height?: number
    /** 空桶也占位，保留时间轴的节律感（凌晨的空档是有信息量的） */
    minBarHeight?: number
  }>(),
  { height: 120, minBarHeight: 2 },
)

const ceiling = computed(() => Math.max(...props.values, 1))

const bars = computed(() =>
  props.values.map((value) => ({
    value,
    heightPercent: value === 0 ? 0 : Math.max((value / ceiling.value) * 100, props.minBarHeight),
  })),
)
</script>

<template>
  <div class="flex items-end gap-1" :style="{ height: `${height}px` }">
    <div
      v-for="(bar, index) in bars"
      :key="index"
      class="group relative flex-1 cursor-default rounded-sm bg-primary/85 transition-colors hover:bg-primary"
      :style="{ height: `${bar.heightPercent}%` }"
    >
      <span
        class="tabular pointer-events-none absolute -top-7 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded border border-border bg-popover px-1.5 py-0.5 text-[10px] text-popover-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
      >
        {{ bar.value }} 次
      </span>
    </div>
  </div>
</template>
