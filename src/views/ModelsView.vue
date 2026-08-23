<script setup lang="ts">
import { ArrowUpRight, Search, SlidersHorizontal } from '@lucide/vue'
import { computed, ref } from 'vue'

import Sparkline from '@/components/charts/Sparkline.vue'
import PageHeader from '@/components/console/PageHeader.vue'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { compact, contextWindow, perMillion } from '@/lib/format'
import { cn } from '@/lib/utils'
import { catalog, VENDOR_META, type CatalogModel, type Vendor } from '@/data/mock'

type SortKey = 'popular' | 'cheapest' | 'context'
type Modality = CatalogModel['modalities'][number]

const SORTERS: Record<SortKey, (a: CatalogModel, b: CatalogModel) => number> = {
  popular: (a, b) => b.weeklyTokens - a.weeklyTokens,
  cheapest: (a, b) => a.promptPrice - b.promptPrice,
  context: (a, b) => b.contextWindow - a.contextWindow,
}

const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: 'popular', label: '最热门' },
  { key: 'cheapest', label: '最低价' },
  { key: 'context', label: '最长上下文' },
]

const MODALITIES: Array<{ key: Modality; label: string }> = [
  { key: 'text', label: '文本' },
  { key: 'image', label: '图像' },
  { key: 'audio', label: '音频' },
]

const query = ref('')
const sortKey = ref<SortKey>('popular')
const selectedModalities = ref<Modality[]>([])
const selectedVendors = ref<Vendor[]>([])

const vendors = computed(() => {
  const counts = new Map<Vendor, number>()
  catalog.forEach((model) => counts.set(model.vendor, (counts.get(model.vendor) ?? 0) + 1))
  return [...counts.entries()].sort((a, b) => b[1] - a[1])
})

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

const results = computed(() => {
  const keyword = query.value.trim().toLowerCase()

  return catalog
    .filter((model) => {
      const matchesKeyword =
        !keyword ||
        model.name.toLowerCase().includes(keyword) ||
        model.id.toLowerCase().includes(keyword) ||
        model.tags.some((tag) => tag.includes(keyword))

      const matchesModality =
        selectedModalities.value.length === 0 ||
        selectedModalities.value.every((modality) => model.modalities.includes(modality))

      const matchesVendor =
        selectedVendors.value.length === 0 || selectedVendors.value.includes(model.vendor)

      return matchesKeyword && matchesModality && matchesVendor
    })
    .sort(SORTERS[sortKey.value])
})

const hasFilters = computed(
  () => selectedModalities.value.length > 0 || selectedVendors.value.length > 0 || query.value !== '',
)

function resetFilters() {
  query.value = ''
  selectedModalities.value = []
  selectedVendors.value = []
}

const CHECK_ROW =
  'flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent-subtle'
</script>

<template>
  <div class="space-y-5">
    <PageHeader
      title="Models"
      :description="`统一接口下的 ${catalog.length} 个模型，价格按每百万 token 计。`"
    >
      <template #actions>
        <div class="flex items-center gap-1 rounded-md border border-border bg-muted p-1">
          <button
            v-for="option in SORT_OPTIONS"
            :key="option.key"
            type="button"
            :class="
              cn(
                'h-7 rounded px-2.5 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                sortKey === option.key
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )
            "
            @click="sortKey = option.key"
          >
            {{ option.label }}
          </button>
        </div>
      </template>
    </PageHeader>

    <div class="flex flex-col gap-5 lg:flex-row">
      <!-- 筛选面板：sticky 让长列表滚动时筛选条件始终可达 -->
      <aside class="w-full shrink-0 lg:sticky lg:top-0 lg:h-fit lg:w-56">
        <Card class="p-3">
          <div class="mb-3 flex items-center justify-between">
            <div class="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <SlidersHorizontal class="size-3.5" />
              筛选
            </div>
            <button
              v-if="hasFilters"
              type="button"
              class="text-xs text-primary transition-opacity hover:opacity-80"
              @click="resetFilters"
            >
              清除
            </button>
          </div>

          <label
            class="mb-4 flex h-8 cursor-text items-center gap-2 rounded-md border border-border bg-muted px-2.5 text-muted-foreground transition-colors focus-within:border-ring focus-within:bg-card"
          >
            <Search class="size-3.5 shrink-0" />
            <input
              v-model="query"
              type="search"
              placeholder="模型名或标签"
              class="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </label>

          <section class="mb-4">
            <p
              class="mb-1 px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
            >
              模态
            </p>
            <label v-for="item in MODALITIES" :key="item.key" :class="CHECK_ROW">
              <input
                type="checkbox"
                class="size-3.5 accent-primary"
                :checked="selectedModalities.includes(item.key)"
                @change="selectedModalities = toggle(selectedModalities, item.key)"
              />
              <span>{{ item.label }}</span>
            </label>
          </section>

          <section>
            <p
              class="mb-1 px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
            >
              厂商
            </p>
            <label v-for="[vendor, count] in vendors" :key="vendor" :class="CHECK_ROW">
              <input
                type="checkbox"
                class="size-3.5 accent-primary"
                :checked="selectedVendors.includes(vendor)"
                @change="selectedVendors = toggle(selectedVendors, vendor)"
              />
              <span
                class="size-2 shrink-0 rounded-full"
                :style="{ backgroundColor: VENDOR_META[vendor].color }"
              />
              <span class="truncate">{{ VENDOR_META[vendor].label }}</span>
              <span class="tabular ml-auto text-xs text-muted-foreground">{{ count }}</span>
            </label>
          </section>
        </Card>
      </aside>

      <section class="min-w-0 flex-1 space-y-2.5">
        <p class="text-xs text-muted-foreground">{{ results.length }} 个结果</p>

        <Card
          v-for="model in results"
          :key="model.id"
          class="group cursor-pointer px-4 py-3.5 transition-colors hover:border-primary/40 hover:bg-accent-subtle"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <span
                  class="size-2 shrink-0 rounded-full"
                  :style="{ backgroundColor: VENDOR_META[model.vendor].color }"
                />
                <h3 class="font-medium tracking-tight">{{ model.name }}</h3>
                <Badge variant="outline">{{ contextWindow(model.contextWindow) }} ctx</Badge>
                <Badge
                  v-for="modality in model.modalities.slice(1)"
                  :key="modality"
                  variant="secondary"
                >
                  {{ modality }}
                </Badge>
                <ArrowUpRight
                  class="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                />
              </div>

              <p class="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                {{ model.description }}
              </p>

              <div class="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                <span class="tabular text-muted-foreground">
                  <span class="text-foreground">{{ perMillion(model.promptPrice) }}</span> in
                </span>
                <span class="tabular text-muted-foreground">
                  <span class="text-foreground">{{ perMillion(model.completionPrice) }}</span> out
                </span>
                <span class="tabular text-muted-foreground">
                  {{ compact(model.weeklyTokens) }} tokens/周
                </span>
              </div>
            </div>

            <div class="hidden shrink-0 flex-col items-end gap-1 sm:flex">
              <Sparkline :values="model.trend" :width="88" :height="26" />
              <span class="text-[10px] text-muted-foreground">近 14 天</span>
            </div>
          </div>
        </Card>

        <Card v-if="results.length === 0" class="px-4 py-10 text-center">
          <p class="text-sm text-muted-foreground">没有匹配的模型，试试放宽筛选条件。</p>
        </Card>
      </section>
    </div>
  </div>
</template>
