<script setup lang="ts">
import { TrendingDown, TrendingUp } from '@lucide/vue'
import { computed } from 'vue'

import Sparkline from '@/components/charts/Sparkline.vue'
import { Card } from '@/components/ui/card'
import { delta } from '@/lib/format'

const props = defineProps<{
  label: string
  value: string
  /** null 表示没有可比的上一周期 —— 显式区别于「环比 0%」 */
  change: number | null
  trend?: number[]
  /** 该指标「涨」是不是好事。延迟这类指标要设 false，否则涨了还标绿会误导 */
  higherIsBetter?: boolean
}>()

const rising = computed(() => (props.change ?? 0) >= 0)
const positive = computed(() => (props.higherIsBetter === false ? !rising.value : rising.value))
</script>

<template>
  <Card class="px-4 py-3.5 transition-colors hover:bg-accent-subtle">
    <div class="flex items-start justify-between gap-3">
      <p class="truncate text-xs text-muted-foreground">{{ label }}</p>
      <Sparkline v-if="trend" :values="trend" :width="52" :height="16" tone="muted" />
    </div>

    <p class="tabular mt-2 text-[26px] font-semibold leading-none tracking-tight">{{ value }}</p>

    <div class="mt-2 flex items-center gap-1 text-xs">
      <template v-if="change !== null">
        <component
          :is="rising ? TrendingUp : TrendingDown"
          class="size-3.5"
          :class="positive ? 'text-success' : 'text-destructive'"
        />
        <span class="tabular" :class="positive ? 'text-success' : 'text-destructive'">
          {{ delta(change) }}
        </span>
        <span class="truncate text-muted-foreground">vs 上周期</span>
      </template>
      <span v-else class="text-muted-foreground">— 无对比数据</span>
    </div>
  </Card>
</template>
