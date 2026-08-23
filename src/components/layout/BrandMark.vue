<script setup lang="ts">
/**
 * 品牌标记：三条汇聚到一点的路径，呼应「多模型路由到统一入口」。
 * 用 currentColor 描边，跟随文字颜色，明暗主题无需额外处理。
 */
withDefaults(defineProps<{ size?: number }>(), { size: 22 })
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.75"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M3 5.5h3.5L11 12l-4.5 6.5H3" />
    <path d="M3 12h8" />
    <circle cx="17.5" cy="12" r="3.2" />
    <path d="M14.3 12H11" />
  </svg>
</template>
