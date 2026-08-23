<script setup lang="ts">
import { ArrowRight, ChevronDown, Globe, ListFilter } from '@lucide/vue'
import { computed, ref } from 'vue'

import StackedBars from '@/components/charts/StackedBars.vue'
import UsageChart from '@/components/charts/UsageChart.vue'
import PageHeader from '@/components/console/PageHeader.vue'
import RankList from '@/components/console/RankList.vue'
import StatCard from '@/components/console/StatCard.vue'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { TabBar, type TabItem } from '@/components/ui/tabs'
import { compact, decimal, usd } from '@/lib/format'
import { cn } from '@/lib/utils'
import { apiKeys, logs, modelUsage, usageSeries, VENDOR_META, type UsagePoint } from '@/data/mock'

type MetricKey = 'spend' | 'tokens' | 'requests'

const METRICS: Array<{ key: MetricKey; label: string; format: (value: number) => string }> = [
  { key: 'spend', label: 'Spend', format: usd },
  { key: 'tokens', label: 'Tokens', format: compact },
  { key: 'requests', label: 'Requests', format: decimal },
]

const TABS: TabItem[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'trends', label: 'Trends' },
]

const RANGES = [
  { key: 7, short: '7d', label: 'Past 7 Days' },
  { key: 14, short: '14d', label: 'Past 2 Weeks' },
  { key: 30, short: '1mo', label: 'Past 1 Month' },
] as const

const tab = ref('overview')
const rangeDays = ref<number>(30)
const metric = ref<MetricKey>('spend')

const activeMetric = computed(() => METRICS.find((item) => item.key === metric.value)!)
const activeRange = computed(() => RANGES.find((range) => range.key === rangeDays.value)!)

const window = computed(() => usageSeries.slice(-rangeDays.value))
/** 等长的上一周期，用于算环比 —— 长度不一致的话百分比没有意义 */
const previousWindow = computed(() => usageSeries.slice(-rangeDays.value * 2, -rangeDays.value))

const sum = (points: UsagePoint[], key: MetricKey) =>
  points.reduce((total, point) => total + point[key], 0)

/** 上一周期无数据时返回 null，而不是 0 ——「没得比」和「持平」是两回事 */
function changeOf(key: MetricKey): number | null {
  if (previousWindow.value.length === 0) return null
  const previous = sum(previousWindow.value, key)
  return previous === 0 ? null : (sum(window.value, key) - previous) / previous
}

const totalSpend = computed(() => sum(window.value, 'spend'))
const totalTokens = computed(() => sum(window.value, 'tokens'))

const cacheHitRate = computed(() => logs.filter((entry) => entry.cached).length / logs.length)

/** 混合单价：总花费 ÷ 总 token（百万）。比单看输入价或输出价更能反映真实成本 */
const blendedPrice = computed(() => totalSpend.value / (totalTokens.value / 1e6))

const stats = computed(() => [
  {
    label: 'Total spend',
    value: usd(totalSpend.value),
    change: changeOf('spend'),
    trend: window.value.map((point) => point.spend),
  },
  {
    label: 'Requests',
    value: decimal(sum(window.value, 'requests')),
    change: changeOf('requests'),
    trend: window.value.map((point) => point.requests),
  },
  {
    label: 'Token volume',
    value: compact(totalTokens.value),
    change: changeOf('tokens'),
    trend: window.value.map((point) => point.tokens),
  },
  {
    label: 'Cache hit rate',
    value: `${Math.round(cacheHitRate.value * 100)}%`,
    change: 0.062,
  },
  {
    label: 'Blended $/1M',
    value: usd(blendedPrice.value),
    change: -0.018,
    higherIsBetter: false,
  },
])

const topKeys = computed(() =>
  [...apiKeys]
    .sort((a, b) => b.spentUsd - a.spentUsd)
    .map((key) => ({ label: key.label, value: key.spentUsd })),
)

const topApps = computed(() => {
  const totals = new Map<string, number>()
  logs.forEach((entry) => totals.set(entry.app, (totals.get(entry.app) ?? 0) + entry.cost))
  return [...totals.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
})

const requestsByModel = computed(() =>
  modelUsage.map((row) => ({
    label: row.name,
    value: row.requests,
    color: VENDOR_META[row.vendor].color,
  })),
)

/* 用量按模型拆分：把每日总量按各模型的长期占比分摊。真实场景下这份数据
   直接来自后端聚合，这里只是让堆叠图有可信的形状。 */
const modelSeries = computed(() =>
  modelUsage.slice(0, 5).map((row) => ({
    label: row.name,
    color: VENDOR_META[row.vendor].color,
  })),
)

const modelStacks = computed(() =>
  window.value.map((point) => ({
    date: point.date.slice(5),
    values: modelUsage.slice(0, 5).map((row) => Number((point.spend * row.share).toFixed(3))),
  })),
)

const usageTypeSplit = computed(() => {
  const credits = logs.filter((entry) => entry.usageType === 'Credits').length
  return [
    { label: 'Credits', value: credits, color: 'var(--chart-completion)' },
    { label: 'BYOK', value: logs.length - credits, color: 'var(--chart-cached)' },
  ]
})

const usageTypeTotal = computed(() =>
  usageTypeSplit.value.reduce((total, item) => total + item.value, 0),
)

const SEGMENT_BASE =
  'h-7 rounded px-2.5 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring'
</script>

<template>
  <div class="space-y-5">
    <PageHeader title="Activity" description="跨模型的用量总览，按 UTC 日聚合。">
      <template #actions>
        <button
          type="button"
          class="flex h-9 items-center gap-1.5 rounded-md border border-border px-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent-subtle hover:text-accent-foreground"
        >
          <Globe class="size-4" />
          GMT+8
        </button>

        <Button variant="outline" size="icon" class="text-muted-foreground" aria-label="筛选">
          <ListFilter />
        </Button>

        <button
          type="button"
          class="flex h-9 min-w-[190px] items-center gap-2 rounded-md border border-border px-2 text-sm transition-colors hover:bg-accent-subtle"
          @click="
            rangeDays = RANGES[(RANGES.findIndex((r) => r.key === rangeDays) + 1) % RANGES.length].key
          "
        >
          <span
            class="tabular rounded border border-border px-1.5 py-0.5 text-xs text-muted-foreground"
          >
            {{ activeRange.short }}
          </span>
          <span>{{ activeRange.label }}</span>
          <ChevronDown class="ml-auto size-4 text-muted-foreground" />
        </button>
      </template>
    </PageHeader>

    <TabBar v-model="tab" :items="TABS" />

    <section class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <StatCard
        v-for="stat in stats"
        :key="stat.label"
        :label="stat.label"
        :value="stat.value"
        :change="stat.change"
        :trend="stat.trend"
        :higher-is-better="stat.higherIsBetter"
      />
    </section>

    <!-- Trends：单指标时间序列，回答「怎么变的」 -->
    <Card v-if="tab === 'trends'">
      <CardHeader class="items-center">
        <CardTitle>{{ activeMetric.label }} 趋势</CardTitle>
        <div class="flex items-center gap-1 rounded-md border border-border bg-muted p-1">
          <button
            v-for="option in METRICS"
            :key="option.key"
            type="button"
            :class="
              cn(
                SEGMENT_BASE,
                metric === option.key
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )
            "
            @click="metric = option.key"
          >
            {{ option.label }}
          </button>
        </div>
      </CardHeader>
      <div class="px-5 pb-5">
        <UsageChart
          :values="window.map((point) => point[metric])"
          :labels="window.map((point) => point.date.slice(5))"
          :format="activeMetric.format"
          :height="260"
        />
      </div>
    </Card>

    <!-- Overview：谁在花钱、花在哪个模型上 -->
    <template v-else>
      <div class="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top API Keys</CardTitle>
            <span class="text-xs text-muted-foreground">按花费</span>
          </CardHeader>
          <div class="px-3 pb-4">
            <RankList :items="topKeys" :format="usd" empty-hint="本周期内没有密钥用量" />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Apps</CardTitle>
            <span class="text-xs text-muted-foreground">按花费</span>
          </CardHeader>
          <div class="px-3 pb-4">
            <RankList :items="topApps" :format="usd" empty-hint="本周期内没有应用调用" />
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usage by model</CardTitle>
          <RouterLink
            to="/models"
            class="flex items-center gap-1 text-xs text-primary transition-opacity hover:opacity-80"
          >
            Explore
            <ArrowRight class="size-3.5" />
          </RouterLink>
        </CardHeader>
        <div class="px-5 pb-5">
          <StackedBars :series="modelSeries" :days="modelStacks" :height="220" :format="usd" />
        </div>
      </Card>

      <div class="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Usage type</CardTitle>
          </CardHeader>
          <div class="space-y-3 px-5 pb-5">
            <div class="flex h-2.5 overflow-hidden rounded-full">
              <div
                v-for="item in usageTypeSplit"
                :key="item.label"
                :style="{
                  width: `${(item.value / usageTypeTotal) * 100}%`,
                  backgroundColor: item.color,
                }"
              />
            </div>
            <div class="flex flex-wrap gap-x-5 gap-y-1.5">
              <span
                v-for="item in usageTypeSplit"
                :key="item.label"
                class="flex items-center gap-1.5 text-xs"
              >
                <span class="size-2 rounded-full" :style="{ backgroundColor: item.color }" />
                <span class="text-muted-foreground">{{ item.label }}</span>
                <span class="tabular">{{ Math.round((item.value / usageTypeTotal) * 100) }}%</span>
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Request volume by model</CardTitle>
          </CardHeader>
          <div class="px-3 pb-4">
            <RankList :items="requestsByModel" :format="decimal" />
          </div>
        </Card>
      </div>
    </template>
  </div>
</template>
