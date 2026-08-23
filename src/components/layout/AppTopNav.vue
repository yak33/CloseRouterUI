<script setup lang="ts">
import { ChevronDown, Search } from '@lucide/vue'

import BrandMark from './BrandMark.vue'
import ThemeToggle from './ThemeToggle.vue'

/**
 * 全局顶栏：横跨整个视口，侧边栏从它下方开始。
 * 这层承载「产品级」导航（跨工作区的公共入口），与侧边栏的「工作区内」
 * 导航是两个不同量级的东西，混在一起会让层级失焦。
 */
const PRODUCT_LINKS = ['Home', 'Models', 'Benchmarks', 'Chat', 'Rankings', 'Apps', 'Docs']
</script>

<template>
  <header
    class="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background px-4"
  >
    <a href="/" class="flex shrink-0 items-center gap-2">
      <BrandMark :size="26" class="text-primary" />
      <span class="font-brand text-[17px] font-semibold tracking-tight">CloseRouter</span>
    </a>

    <label
      class="hidden h-9 w-[275px] cursor-text items-center gap-2 rounded-lg border border-border bg-background px-3 text-muted-foreground transition-colors focus-within:border-ring md:flex"
    >
      <Search class="size-4 shrink-0" />
      <input
        type="search"
        placeholder="Search"
        class="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
      />
      <kbd class="tabular shrink-0 text-xs text-muted-foreground">⌘ K</kbd>
    </label>

    <!-- 右侧统一成一个 ml-auto 组，避免给子组件传 class 去凑对齐 -->
    <div class="ml-auto flex items-center gap-1">
      <nav class="hidden items-center gap-1 lg:flex">
        <a
          v-for="link in PRODUCT_LINKS"
          :key="link"
          href="#"
          class="rounded-md px-3 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
        >
          {{ link }}
        </a>
      </nav>

      <ThemeToggle />

      <button
        type="button"
        class="flex shrink-0 items-center gap-2 rounded-md py-1 pl-1 pr-2 transition-colors hover:bg-accent"
      >
        <span
          class="grid size-7 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
        >
          Z
        </span>
        <span class="hidden text-sm sm:block">Personal</span>
        <ChevronDown class="size-4 text-muted-foreground" />
      </button>
    </div>
  </header>
</template>
