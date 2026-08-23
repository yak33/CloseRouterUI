<script setup lang="ts">
import {
  ChevronDown,
  ChevronUp,
  Database,
  ListFilter,
  MoreVertical,
  RefreshCw,
  Settings2,
} from '@lucide/vue'
import { computed, ref } from 'vue'

import BarSeries from '@/components/charts/BarSeries.vue'
import PageHeader from '@/components/console/PageHeader.vue'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { TabBar, type TabItem } from '@/components/ui/tabs'
import { decimal, usd } from '@/lib/format'
import { logs, logVolume, VENDOR_META } from '@/data/mock'

const TABS: TabItem[] = [
  { value: 'generations', label: 'Generations' },
  { value: 'upstream', label: 'Upstream Requests' },
  { value: 'sessions', label: 'Sessions' },
  { value: 'batches', label: 'Batches' },
]

const tab = ref('generations')
const chartOpen = ref(true)

const STAMP = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

/** "Aug 22, 12:28 PM" —— Intl 默认会给出 "Aug 22 at 12:28 PM"，去掉 at 更紧凑 */
const formatStamp = (iso: string) => STAMP.format(new Date(iso)).replace(' at ', ', ')

const totalRequests = computed(() => logVolume.reduce((sum, value) => sum + value, 0))
</script>

<template>
  <div class="space-y-5">
    <PageHeader title="Logs">
      <template #actions>
        <Button variant="ghost" size="icon" class="text-muted-foreground" aria-label="刷新">
          <RefreshCw />
        </Button>
        <Button variant="outline" size="icon" class="text-muted-foreground" aria-label="筛选">
          <ListFilter />
        </Button>

        <button
          type="button"
          class="flex h-9 min-w-[190px] items-center gap-2 rounded-md border border-border px-2 text-sm transition-colors hover:bg-accent-subtle"
        >
          <span
            class="tabular rounded border border-border px-1.5 py-0.5 text-xs text-muted-foreground"
          >
            1d
          </span>
          <span>Past 24 Hours</span>
          <ChevronDown class="ml-auto size-4 text-muted-foreground" />
        </button>

        <Button variant="ghost" size="icon" class="text-muted-foreground" aria-label="更多操作">
          <MoreVertical />
        </Button>
      </template>
    </PageHeader>

    <TabBar v-model="tab" :items="TABS" />

    <Card class="overflow-hidden">
      <!-- 直方图可折叠：排查具体请求时它只是干扰，收起来能多看四五行 -->
      <div class="border-b border-border px-5 pb-4 pt-5">
        <div class="mb-3 flex items-start justify-between gap-4">
          <div>
            <p class="text-sm font-medium">请求量</p>
            <p class="tabular mt-0.5 text-xs text-muted-foreground">
              过去 24 小时共 {{ decimal(totalRequests) }} 次
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            class="text-muted-foreground"
            :aria-label="chartOpen ? '收起图表' : '展开图表'"
            @click="chartOpen = !chartOpen"
          >
            <component :is="chartOpen ? ChevronUp : ChevronDown" />
          </Button>
        </div>
        <BarSeries v-if="chartOpen" :values="logVolume" :height="110" />
      </div>

      <div class="overflow-x-auto scrollbar-subtle">
        <table class="w-full min-w-[1180px] border-collapse text-sm">
          <thead>
            <tr class="border-b border-border text-left">
              <th class="px-5 py-2.5 text-xs font-medium text-muted-foreground">Date</th>
              <th class="px-3 py-2.5 text-xs font-medium text-muted-foreground">Model</th>
              <th class="px-3 py-2.5 text-xs font-medium text-muted-foreground">Provider</th>
              <th class="px-3 py-2.5 text-xs font-medium text-muted-foreground">App</th>
              <th class="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">Input</th>
              <th class="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">
                Output
              </th>
              <th class="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">Cost</th>
              <th class="px-3 py-2.5 text-xs font-medium text-muted-foreground">Usage Type</th>
              <th class="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">Speed</th>
              <th class="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">
                Duration
              </th>
              <th class="w-12 px-3 py-2.5 text-right">
                <Settings2 class="ml-auto size-4 text-muted-foreground" />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="entry in logs"
              :key="entry.id"
              class="border-b border-border transition-colors last:border-0 hover:bg-accent-subtle"
            >
              <td class="tabular whitespace-nowrap px-5 py-3 text-muted-foreground">
                {{ formatStamp(entry.timestamp) }}
              </td>

              <td class="whitespace-nowrap px-3 py-3">
                <div class="flex items-center gap-2">
                  <span
                    class="size-2 shrink-0 rounded-full"
                    :style="{ backgroundColor: VENDOR_META[entry.vendor].color }"
                  />
                  {{ entry.modelName }}
                </div>
              </td>

              <td class="whitespace-nowrap px-3 py-3 text-muted-foreground">{{ entry.provider }}</td>
              <td class="whitespace-nowrap px-3 py-3">{{ entry.app }}</td>

              <td class="tabular whitespace-nowrap px-3 py-3 text-right">
                {{ decimal(entry.inputTokens) }} <span class="text-muted-foreground">tok</span>
              </td>
              <td class="tabular whitespace-nowrap px-3 py-3 text-right">
                {{ decimal(entry.outputTokens) }} <span class="text-muted-foreground">tok</span>
              </td>
              <td class="tabular whitespace-nowrap px-3 py-3 text-right">{{ usd(entry.cost) }}</td>

              <td class="whitespace-nowrap px-3 py-3">
                <div class="flex items-center gap-1.5">
                  <!-- 命中缓存的请求单独标记：成本异常低的行需要有解释 -->
                  <Database
                    v-if="entry.cached"
                    class="size-3.5 text-muted-foreground"
                    aria-label="命中提示词缓存"
                  />
                  <span :class="entry.usageType === 'BYOK' ? 'text-primary' : ''">
                    {{ entry.usageType }}
                  </span>
                </div>
              </td>

              <td class="tabular whitespace-nowrap px-3 py-3 text-right">
                {{ entry.speed }} <span class="text-muted-foreground">tok/s</span>
              </td>
              <td class="tabular whitespace-nowrap px-3 py-3 text-right text-muted-foreground">
                {{ entry.duration }}s
              </td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  </div>
</template>
