<script setup lang="ts">
import { ArrowUp, Sparkles } from '@lucide/vue'

import { Badge } from '@/components/ui/badge'
import { VENDOR_META, catalog } from '@/data/mock'

const SUGGESTIONS = [
  '比较这几个模型在长上下文下的表现',
  '把这段 SQL 改写成 CTE 结构',
  '给这个接口写一份 table-driven 测试',
]
</script>

<template>
  <div class="flex min-h-[calc(100vh-11rem)] flex-col items-center justify-center gap-8">
    <div class="text-center">
      <div
        class="mx-auto mb-4 grid size-11 place-items-center rounded-xl border border-border bg-muted"
      >
        <Sparkles class="size-5 text-primary" />
      </div>
      <h2 class="font-brand text-2xl font-semibold tracking-tight">开始一段对话</h2>
      <p class="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
        同一个输入框可并排比较多个模型的输出，费用按实际 token 从余额扣减。
      </p>
    </div>

    <div class="w-full max-w-2xl space-y-3">
      <div
        class="flex items-end gap-2 rounded-xl border border-border bg-card p-2.5 transition-colors focus-within:border-ring"
      >
        <textarea
          rows="2"
          placeholder="输入你的问题…"
          class="min-w-0 flex-1 resize-none bg-transparent px-1.5 py-1 text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          type="button"
          class="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90"
          aria-label="发送"
        >
          <ArrowUp class="size-4" />
        </button>
      </div>

      <div class="flex flex-wrap justify-center gap-2">
        <button
          v-for="text in SUGGESTIONS"
          :key="text"
          type="button"
          class="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          {{ text }}
        </button>
      </div>
    </div>

    <div class="flex flex-wrap items-center justify-center gap-2">
      <span class="text-xs text-muted-foreground">可选模型</span>
      <Badge v-for="model in catalog.slice(0, 4)" :key="model.id" variant="outline">
        <span
          class="size-1.5 rounded-full"
          :style="{ backgroundColor: VENDOR_META[model.vendor].color }"
        />
        {{ model.name }}
      </Badge>
      <Badge variant="secondary">+{{ catalog.length - 4 }}</Badge>
    </div>
  </div>
</template>
