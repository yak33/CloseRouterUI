<script setup lang="ts">
import { Wallet } from '@lucide/vue'
import { ref } from 'vue'

import PageHeader from '@/components/console/PageHeader.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usd } from '@/lib/format'
import { cn } from '@/lib/utils'

const PRESETS = [10, 25, 50, 100, 250] as const

const balance = 181.58
const autoTopUp = ref(true)
const amount = ref<number>(50)

const transactions = [
  { id: 't_09', date: '2026-08-19', type: '充值', detail: 'Visa •••• 4242', amount: 100 },
  { id: 't_08', date: '2026-08-12', type: '用量结算', detail: '7 月 29 日 – 8 月 12 日', amount: -63.41 },
  { id: 't_07', date: '2026-07-28', type: '充值', detail: '自动充值触发', amount: 100 },
  { id: 't_06', date: '2026-07-26', type: '用量结算', detail: '7 月 12 日 – 7 月 26 日', amount: -48.9 },
  { id: 't_05', date: '2026-07-11', type: '赠送额度', detail: '开发者计划', amount: 25 },
]
</script>

<template>
  <div class="space-y-5">
    <PageHeader title="Credits" description="余额按实际用量扣减，不设月费，未用完不过期。" />

    <div class="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
      <Card class="flex flex-col justify-between p-5">
        <div>
          <div class="flex items-center gap-2 text-xs text-muted-foreground">
            <Wallet class="size-3.5" />
            当前余额
          </div>
          <p class="tabular mt-2 text-4xl font-semibold tracking-tight">{{ usd(balance) }}</p>
          <p class="mt-1.5 text-xs text-muted-foreground">
            按近 30 天均速，约可支撑 <span class="tabular text-foreground">42 天</span>
          </p>
        </div>

        <label
          class="mt-6 flex cursor-pointer items-start justify-between gap-4 rounded-md border border-border p-3 transition-colors hover:bg-accent-subtle"
        >
          <span class="min-w-0">
            <span class="block text-sm font-medium">余额不足时自动充值</span>
            <span class="mt-0.5 block text-xs text-muted-foreground">
              低于 $20 时自动补足 $100
            </span>
          </span>
          <input v-model="autoTopUp" type="checkbox" class="mt-0.5 size-4 shrink-0 accent-primary" />
        </label>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>充值</CardTitle>
          <Badge variant="outline">Stripe</Badge>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex flex-wrap gap-2">
            <button
              v-for="preset in PRESETS"
              :key="preset"
              type="button"
              :class="
                cn(
                  'tabular h-9 min-w-[68px] rounded-md border px-3 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  amount === preset
                    ? 'border-primary bg-accent text-primary'
                    : 'border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground',
                )
              "
              @click="amount = preset"
            >
              ${{ preset }}
            </button>
          </div>

          <div class="space-y-1.5">
            <label for="custom-amount" class="block text-xs text-muted-foreground">自定义金额</label>
            <div
              class="flex h-9 items-center gap-1.5 rounded-md border border-border bg-muted px-3 transition-colors focus-within:border-ring focus-within:bg-card"
            >
              <span class="text-sm text-muted-foreground">$</span>
              <input
                id="custom-amount"
                v-model.number="amount"
                type="number"
                min="5"
                class="tabular min-w-0 flex-1 bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          <Button class="w-full">充值 {{ usd(amount || 0) }}</Button>
          <p class="text-center text-xs text-muted-foreground">
            支付由 Stripe 处理，本站不存储卡号信息
          </p>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>账单流水</CardTitle>
      </CardHeader>
      <div class="overflow-x-auto scrollbar-subtle">
        <table class="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr class="border-y border-border text-left">
              <th class="px-5 py-2 text-xs font-medium text-muted-foreground">日期</th>
              <th class="px-3 py-2 text-xs font-medium text-muted-foreground">类型</th>
              <th class="px-3 py-2 text-xs font-medium text-muted-foreground">说明</th>
              <th class="px-5 py-2 text-right text-xs font-medium text-muted-foreground">金额</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in transactions"
              :key="item.id"
              class="border-b border-border transition-colors last:border-0 hover:bg-accent-subtle"
            >
              <td class="tabular px-5 py-2.5 text-muted-foreground">{{ item.date }}</td>
              <td class="px-3 py-2.5">{{ item.type }}</td>
              <td class="px-3 py-2.5 text-muted-foreground">{{ item.detail }}</td>
              <td
                class="tabular px-5 py-2.5 text-right font-medium"
                :class="item.amount > 0 ? 'text-success' : 'text-foreground'"
              >
                {{ item.amount > 0 ? '+' : '' }}{{ usd(item.amount) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  </div>
</template>
