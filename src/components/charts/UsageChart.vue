<script setup lang="ts">
import { useElementSize } from '@vueuse/core'
import { computed, ref, useId } from 'vue'

import { monotonePath } from '@/lib/curve'

/**
 * 用量面积图。
 *
 * 刻意手写而不引三方图表库：整张图的颜色全部走 CSS 令牌（currentColor /
 * --color-primary），明暗主题切换零成本，也不会被库的默认审美污染。
 *
 * @author ZHANGCHAO
 * @date 2026/08/22
 */
const props = withDefaults(
  defineProps<{
    values: number[]
    labels: string[]
    format?: (value: number) => string
    height?: number
  }>(),
  {
    format: (value: number) => String(value),
    height: 220,
  },
)

const PADDING = { top: 12, right: 4, bottom: 24, left: 4 }
const GRID_LINES = 4

const container = ref<HTMLElement | null>(null)
const { width } = useElementSize(container)
const gradientId = `usage-gradient-${useId()}`

const hoverIndex = ref<number | null>(null)

const plot = computed(() => {
  const w = Math.max(width.value, 1)
  return {
    width: w,
    innerWidth: Math.max(w - PADDING.left - PADDING.right, 1),
    innerHeight: Math.max(props.height - PADDING.top - PADDING.bottom, 1),
  }
})

/** 上留 15% 余量，曲线峰值不会顶到卡片边缘 */
const ceiling = computed(() => Math.max(...props.values, 1) * 1.15)

const coords = computed(() => {
  const { innerWidth, innerHeight } = plot.value
  const step = props.values.length > 1 ? innerWidth / (props.values.length - 1) : 0
  return props.values.map((value, i) => ({
    x: PADDING.left + step * i,
    y: PADDING.top + innerHeight * (1 - value / ceiling.value),
  }))
})

const linePath = computed(() => monotonePath(coords.value))

const areaPath = computed(() => {
  const points = coords.value
  if (points.length === 0) return ''
  const baseline = PADDING.top + plot.value.innerHeight
  const last = points[points.length - 1]
  return `${linePath.value} L ${last.x} ${baseline} L ${points[0].x} ${baseline} Z`
})

const gridRows = computed(() =>
  Array.from({ length: GRID_LINES + 1 }, (_, i) => PADDING.top + (plot.value.innerHeight / GRID_LINES) * i),
)

/** x 轴只标首、中、尾三处 —— 30 个日期全打上去会糊成一片 */
const axisTicks = computed(() => {
  const last = props.labels.length - 1
  if (last < 2) return props.labels.map((label, index) => ({ label, index }))
  return [0, Math.floor(last / 2), last].map((index) => ({ label: props.labels[index], index }))
})

const active = computed(() => {
  if (hoverIndex.value === null) return null
  const index = hoverIndex.value
  return { index, point: coords.value[index], value: props.values[index], label: props.labels[index] }
})

function trackPointer(event: PointerEvent) {
  const rect = (event.currentTarget as SVGElement).getBoundingClientRect()
  const ratio = (event.clientX - rect.left - PADDING.left) / plot.value.innerWidth
  const index = Math.round(ratio * (props.values.length - 1))
  hoverIndex.value = Math.min(Math.max(index, 0), props.values.length - 1)
}
</script>

<template>
  <div ref="container" class="relative w-full select-none">
    <svg
      :width="plot.width"
      :height="height"
      class="overflow-visible"
      @pointermove="trackPointer"
      @pointerleave="hoverIndex = null"
    >
      <defs>
        <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--color-primary)" stop-opacity="0.28" />
          <stop offset="100%" stop-color="var(--color-primary)" stop-opacity="0" />
        </linearGradient>
      </defs>

      <line
        v-for="(y, i) in gridRows"
        :key="`grid-${i}`"
        :x1="PADDING.left"
        :x2="plot.width - PADDING.right"
        :y1="y"
        :y2="y"
        class="stroke-border"
        stroke-width="1"
        :stroke-dasharray="i === gridRows.length - 1 ? undefined : '3 4'"
        :opacity="i === gridRows.length - 1 ? 1 : 0.55"
      />

      <path :d="areaPath" :fill="`url(#${gradientId})`" />
      <path
        :d="linePath"
        fill="none"
        stroke="var(--color-primary)"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <g v-if="active">
        <line
          :x1="active.point.x"
          :x2="active.point.x"
          :y1="PADDING.top"
          :y2="PADDING.top + plot.innerHeight"
          class="stroke-border"
          stroke-width="1"
        />
        <circle
          :cx="active.point.x"
          :cy="active.point.y"
          r="4"
          fill="var(--color-primary)"
          stroke="var(--color-background)"
          stroke-width="2"
        />
      </g>

      <text
        v-for="tick in axisTicks"
        :key="tick.label"
        :x="coords[tick.index]?.x ?? 0"
        :y="height - 6"
        class="fill-muted-foreground text-[10px]"
        :text-anchor="tick.index === 0 ? 'start' : tick.index === labels.length - 1 ? 'end' : 'middle'"
      >
        {{ tick.label }}
      </text>
    </svg>

    <div
      v-if="active"
      class="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md border border-border bg-popover px-2.5 py-1.5 shadow-lg"
      :style="{ left: `${active.point.x}px`, top: `${active.point.y - 10}px` }"
    >
      <p class="text-[10px] text-muted-foreground">{{ active.label }}</p>
      <p class="tabular text-xs font-medium text-popover-foreground">{{ format(active.value) }}</p>
    </div>
  </div>
</template>
