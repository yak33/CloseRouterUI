<script setup lang="ts">
import { ref } from 'vue'

import PageHeader from '@/components/console/PageHeader.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const displayName = ref('ZHANGCHAO')
const email = ref('zhangchao@example.com')
const defaultModel = ref('anthropic/claude-opus-5')

const toggles = ref([
  { key: 'training', label: '允许用于模型训练', hint: '关闭后请求不会进入任何厂商的训练集', enabled: false },
  { key: 'fallback', label: '自动降级到备用厂商', hint: '主厂商超时或限流时切换，可能改变响应风格', enabled: true },
  { key: 'logging', label: '保留 30 天请求日志', hint: '用于排障，关闭后仅保留聚合用量', enabled: true },
])

const FIELD =
  'h-9 w-full rounded-md border border-border bg-muted px-3 text-sm outline-none transition-colors focus:border-ring focus:bg-card'
</script>

<template>
  <div class="max-w-3xl space-y-5">
    <PageHeader title="Settings" description="账户资料与请求路由的默认行为。" />

    <Card>
      <CardHeader>
        <CardTitle>账户资料</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-1.5">
            <label for="display-name" class="block text-xs text-muted-foreground">显示名称</label>
            <input id="display-name" v-model="displayName" :class="FIELD" />
          </div>
          <div class="space-y-1.5">
            <label for="email" class="block text-xs text-muted-foreground">邮箱</label>
            <input id="email" v-model="email" type="email" :class="FIELD" />
          </div>
        </div>

        <div class="space-y-1.5">
          <label for="default-model" class="block text-xs text-muted-foreground">默认模型</label>
          <select id="default-model" v-model="defaultModel" :class="FIELD">
            <option value="anthropic/claude-opus-5">Claude Opus 5</option>
            <option value="openai/gpt-5.2">GPT-5.2</option>
            <option value="google/gemini-3-pro">Gemini 3 Pro</option>
            <option value="deepseek/deepseek-v4">DeepSeek V4</option>
          </select>
          <p class="text-xs text-muted-foreground">
            未在请求体中显式指定 model 时使用
          </p>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>隐私与路由</CardTitle>
      </CardHeader>
      <CardContent class="divide-y divide-border">
        <label
          v-for="item in toggles"
          :key="item.key"
          class="flex cursor-pointer items-start justify-between gap-6 py-3 first:pt-0 last:pb-0"
        >
          <span class="min-w-0">
            <span class="block text-sm font-medium">{{ item.label }}</span>
            <span class="mt-0.5 block text-xs text-muted-foreground">{{ item.hint }}</span>
          </span>
          <input v-model="item.enabled" type="checkbox" class="mt-0.5 size-4 shrink-0 accent-primary" />
        </label>
      </CardContent>
    </Card>

    <Card class="border-destructive/40">
      <CardHeader>
        <CardTitle class="text-destructive">危险操作</CardTitle>
      </CardHeader>
      <CardContent class="flex flex-wrap items-center justify-between gap-4">
        <p class="text-sm text-muted-foreground">
          删除账户将立即吊销全部密钥，余额不予退还。
        </p>
        <Button variant="destructive" size="sm">删除账户</Button>
      </CardContent>
    </Card>

    <div class="flex justify-end gap-2">
      <Button variant="outline" size="sm">重置</Button>
      <Button size="sm">保存更改</Button>
    </div>
  </div>
</template>
