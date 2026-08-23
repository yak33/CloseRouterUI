<script setup lang="ts">
import { Copy, MoreHorizontal, Plus } from '@lucide/vue'

import PageHeader from '@/components/console/PageHeader.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { usd } from '@/lib/format'
import { apiKeys } from '@/data/mock'

/** null 表示不限额，进度条不渲染 —— 用 0 会误显示成「已用满」 */
const usageRatio = (spent: number, limit: number | null) =>
  limit === null ? null : Math.min(spent / limit, 1)
</script>

<template>
  <div class="space-y-5">
    <PageHeader title="API Keys" description="密钥仅在创建时完整展示一次，之后只保留后四位。">
      <template #actions>
        <Button size="sm">
          <Plus />
          新建密钥
        </Button>
      </template>
    </PageHeader>

    <Card>
      <CardHeader>
        <CardTitle>全部密钥</CardTitle>
        <Badge variant="outline">{{ apiKeys.length }}</Badge>
      </CardHeader>

      <div class="overflow-x-auto scrollbar-subtle">
        <table class="w-full min-w-[820px] border-collapse text-sm">
          <thead>
            <tr class="border-y border-border text-left">
              <th class="px-5 py-2 text-xs font-medium text-muted-foreground">名称</th>
              <th class="px-3 py-2 text-xs font-medium text-muted-foreground">密钥</th>
              <th class="px-3 py-2 text-xs font-medium text-muted-foreground">额度使用</th>
              <th class="px-3 py-2 text-xs font-medium text-muted-foreground">最近调用</th>
              <th class="px-3 py-2 text-xs font-medium text-muted-foreground">状态</th>
              <th class="px-5 py-2 text-right text-xs font-medium text-muted-foreground">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="key in apiKeys"
              :key="key.id"
              class="group border-b border-border transition-colors last:border-0 hover:bg-accent-subtle"
            >
              <td class="px-5 py-3">
                <p class="font-medium">{{ key.label }}</p>
                <p class="tabular mt-0.5 text-xs text-muted-foreground">
                  创建于 {{ key.createdAt }}
                </p>
              </td>

              <td class="px-3 py-3">
                <div class="flex items-center gap-1.5">
                  <code class="font-mono text-xs text-muted-foreground">{{ key.masked }}</code>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    class="size-6 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="复制密钥"
                  >
                    <Copy class="size-3" />
                  </Button>
                </div>
              </td>

              <td class="px-3 py-3">
                <template v-if="usageRatio(key.spentUsd, key.limitUsd) !== null">
                  <div class="flex items-center gap-2">
                    <div class="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                      <div
                        class="h-full rounded-full transition-all"
                        :class="
                          usageRatio(key.spentUsd, key.limitUsd)! > 0.85 ? 'bg-warning' : 'bg-primary'
                        "
                        :style="{ width: `${usageRatio(key.spentUsd, key.limitUsd)! * 100}%` }"
                      />
                    </div>
                    <span class="tabular text-xs text-muted-foreground">
                      {{ usd(key.spentUsd) }} / {{ usd(key.limitUsd!) }}
                    </span>
                  </div>
                </template>
                <span v-else class="tabular text-xs text-muted-foreground">
                  {{ usd(key.spentUsd) }} · 不限额
                </span>
              </td>

              <td class="tabular px-3 py-3 text-xs text-muted-foreground">
                {{ key.lastUsed ?? '从未' }}
              </td>

              <td class="px-3 py-3">
                <Badge :variant="key.status === 'active' ? 'success' : 'outline'">
                  {{ key.status === 'active' ? '启用' : '停用' }}
                </Badge>
              </td>

              <td class="px-5 py-3 text-right">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  class="text-muted-foreground"
                  aria-label="更多操作"
                >
                  <MoreHorizontal />
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  </div>
</template>
