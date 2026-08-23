<script setup lang="ts">
import {
  Boxes,
  ChevronsUpDown,
  KeyRound,
  LayoutGrid,
  MessagesSquare,
  PanelLeft,
  ScrollText,
  Settings,
  Wallet,
} from '@lucide/vue'
import type { Component } from 'vue'

import { cn } from '@/lib/utils'
import { catalog } from '@/data/mock'

interface NavItem {
  to: string
  label: string
  icon: Component
  badge?: string
}

defineProps<{ collapsed: boolean }>()
defineEmits<{ toggle: [] }>()

const workspace: NavItem[] = [
  { to: '/activity', label: 'Overview', icon: LayoutGrid },
  { to: '/models', label: 'Models', icon: Boxes, badge: String(catalog.length) },
  { to: '/chat', label: 'Chat', icon: MessagesSquare },
  { to: '/keys', label: 'API Keys', icon: KeyRound },
]

const account: NavItem[] = [
  { to: '/logs', label: 'Logs', icon: ScrollText },
  { to: '/credits', label: 'Credits', icon: Wallet },
  { to: '/settings', label: 'Settings', icon: Settings },
]

/* 36px 而非 44px：控制台侧边栏项多，紧凑排布能让整组导航一眼扫完，
   过高的行距会把分组结构撑散。 */
const ITEM_BASE =
  'group relative flex h-9 items-center gap-2.5 rounded-md px-3 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring'

/* 选中/悬浮态完全由令牌驱动：accent 是 primary 的 7.8% 淡染，
   accent-subtle 是 3.1%。亮色下自动是紫，暗色下自动是柠檬绿，
   这里不需要任何 dark: 变体。 */
const ITEM_ACTIVE = 'bg-accent font-medium text-accent-foreground'
const ITEM_IDLE = 'text-muted-foreground hover:bg-accent-subtle hover:text-accent-foreground'

const SECTION_LABEL =
  'px-3 pb-1.5 pt-5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground'
</script>

<template>
  <aside
    :class="
      cn(
        'flex h-full shrink-0 flex-col border-r border-border bg-background transition-[width] duration-200',
        collapsed ? 'w-[60px]' : 'w-[240px]',
      )
    "
  >
    <div class="px-3 pt-4">
      <button
        v-if="!collapsed"
        type="button"
        class="flex h-9 w-full items-center justify-between gap-2 rounded-md border border-border px-3 text-sm transition-colors hover:bg-accent-subtle"
      >
        <span class="truncate font-medium">Default Workspace</span>
        <ChevronsUpDown class="size-3.5 shrink-0 text-muted-foreground" />
      </button>
      <button
        v-else
        type="button"
        class="grid size-9 place-items-center rounded-md border border-border transition-colors hover:bg-accent-subtle"
        title="Default Workspace"
      >
        <span class="text-sm font-semibold">D</span>
      </button>
    </div>

    <nav class="flex-1 overflow-y-auto scrollbar-subtle px-3 py-3">
      <div class="space-y-0.5">
        <RouterLink
          v-for="item in workspace"
          :key="item.to"
          v-slot="{ isActive, href, navigate }"
          :to="item.to"
          custom
        >
          <a
            :href="href"
            :class="cn(ITEM_BASE, isActive ? ITEM_ACTIVE : ITEM_IDLE, collapsed && 'justify-center px-0')"
            :title="collapsed ? item.label : undefined"
            @click="navigate"
          >
            <component :is="item.icon" class="size-4 shrink-0" />
            <template v-if="!collapsed">
              <span class="truncate">{{ item.label }}</span>
              <span class="tabular ml-auto text-xs text-muted-foreground">{{ item.badge }}</span>
            </template>
          </a>
        </RouterLink>
      </div>

      <p v-if="!collapsed" :class="SECTION_LABEL">Account</p>
      <div v-else class="my-3 border-t border-border" />

      <div class="space-y-0.5">
        <RouterLink
          v-for="item in account"
          :key="item.to"
          v-slot="{ isActive, href, navigate }"
          :to="item.to"
          custom
        >
          <a
            :href="href"
            :class="cn(ITEM_BASE, isActive ? ITEM_ACTIVE : ITEM_IDLE, collapsed && 'justify-center px-0')"
            :title="collapsed ? item.label : undefined"
            @click="navigate"
          >
            <component :is="item.icon" class="size-4 shrink-0" />
            <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
          </a>
        </RouterLink>
      </div>
    </nav>

    <div class="border-t border-border p-3">
      <button
        type="button"
        :class="cn(ITEM_BASE, ITEM_IDLE, 'w-full', collapsed && 'justify-center px-0')"
        :title="collapsed ? '展开侧边栏' : '折叠侧边栏'"
        @click="$emit('toggle')"
      >
        <PanelLeft class="size-4 shrink-0" />
        <span v-if="!collapsed" class="truncate">折叠</span>
      </button>
    </div>
  </aside>
</template>
