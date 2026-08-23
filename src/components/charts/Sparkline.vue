<script setup lang="ts">
import { computed } from 'vue'

import { monotonePath } from '@/lib/curve'

/**
 * 行内火花线。无坐标轴、无交互，只负责传达「趋势方向」这一件事。
 * 高度压到 20px 以内，才能塞进表格行而不撑高行距。
 */
const props = withDefaults(
  defineProps<{
    values: number[]
    width?: number
    height?: number
    tone?: 'primary' | 'muted'
  }>(),
  { width: 72, height: 20, tone: 'primary' },
)

const path = computed(() => {
  const min = Math.min(...props.values)
  const max = Math.max(...props.values)
  const span = max - min || 1
  const step = props.values.length > 1 ? (props.width - 2) / (props.values.length - 1) : 0

  return monotonePath(
    props.values.map((value, i) => ({
      x: 1 + step * i,
      y: 1 + (props.height - 2) * (1 - (value - min) / span),
    })),
  )
})

const stroke = computed(() =>
  props.tone === 'primary' ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
)
</script>

<template>
  <svg :width="width" :height="height" class="shrink-0 overflow-visible" aria-hidden="true">
    <path :d="path" fill="none" :stroke="stroke" stroke-width="1.5" stroke-linecap="round" />
  </svg>
</template>
