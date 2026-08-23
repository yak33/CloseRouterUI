<script setup lang="ts">
import { computed } from 'vue'

/**
 * 按日堆叠柱状图。
 *
 * 用堆叠而不是分组：这里要回答的问题是「总量怎么变 + 谁占了多少」，
 * 分组柱会把总量拆散，读者得自己做加法。
 */
export interface StackSeries {
  label: string
  color: string
}

const props = withDefaults(
  defineProps<{
    series: StackSeries[]
    days: Array<{ date: string; values: number[] }>
    height?: number
    format?: (value: number) => string
  }>(),
  { height: 200, format: (value: number) => String(value) },
)

const ceiling = computed(() =>
  Math.max(...props.days.map((day) => day.values.reduce((sum, value) => sum + value, 0)), 1),
)

const columns = computed(() =>
  props.days.map((day) => {
    const total = day.values.reduce((sum, value) => sum + value, 0)
    return {
      date: day.date,
      total,
      /* 从下往上堆，所以渲染顺序要反过来 —— flex-col-reverse 比手算 y 偏移可靠 */
      segments: day.values.map((value, index) => ({
        color: props.series[index].color,
        label: props.series[index].label,
        value,
        percent: total === 0 ? 0 : (value / total) * 100,
      })),
      heightPercent: (total / ceiling.value) * 100,
    }
  }),
)

/** 首、中、尾三个刻度，30 根柱子全标日期会糊成一片 */
const ticks = computed(() => {
  const last = props.days.length - 1
  if (last < 2) return props.days.map((day, index) => ({ index, date: day.date }))
  return [0, Math.floor(last / 2), last].map((index) => ({ index, date: props.days[index].date }))
})
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-end gap-[3px]" :style="{ height: `${height}px` }">
      <div
        v-for="column in columns"
        :key="column.date"
        class="group relative flex flex-1 flex-col-reverse overflow-hidden rounded-sm"
        :style="{ height: `${column.heightPercent}%` }"
      >
        <div
          v-for="segment in column.segments"
          :key="segment.label"
          :style="{ height: `${segment.percent}%`, backgroundColor: segment.color }"
          class="w-full transition-opacity group-hover:opacity-80"
        />

        <div
          class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1.5 text-left shadow-lg group-hover:block"
        >
          <p class="mb-1 text-[10px] text-muted-foreground">{{ column.date }}</p>
          <p
            v-for="segment in [...column.segments].reverse()"
            :key="segment.label"
            class="flex items-center gap-1.5 text-[11px]"
          >
            <span class="size-1.5 rounded-full" :style="{ backgroundColor: segment.color }" />
            <span class="text-popover-foreground">{{ segment.label }}</span>
            <span class="tabular ml-auto pl-3 text-muted-foreground">
              {{ format(segment.value) }}
            </span>
          </p>
        </div>
      </div>
    </div>

    <div class="relative h-4">
      <span
        v-for="tick in ticks"
        :key="tick.date"
        class="tabular absolute text-[10px] text-muted-foreground"
        :style="{
          left: `${(tick.index / Math.max(days.length - 1, 1)) * 100}%`,
          transform:
            tick.index === 0
              ? 'none'
              : tick.index === days.length - 1
                ? 'translateX(-100%)'
                : 'translateX(-50%)',
        }"
      >
        {{ tick.date }}
      </span>
    </div>

    <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      <span
        v-for="item in series"
        :key="item.label"
        class="flex items-center gap-1.5 text-xs text-muted-foreground"
      >
        <span class="size-2 rounded-full" :style="{ backgroundColor: item.color }" />
        {{ item.label }}
      </span>
    </div>
  </div>
</template>
