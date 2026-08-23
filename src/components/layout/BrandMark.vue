<script setup lang="ts">
/**
 * 品牌标记：独角仙形象插画，紫色与 --primary 同族。
 * 插画自带配色，刻意不走 currentColor —— 形象类标志独立于令牌体系，
 * 明暗主题下保持同一副面孔。
 */
import logoUrl from '@/assets/logo.png'

withDefaults(defineProps<{ size?: number }>(), { size: 22 })
</script>

<template>
  <img
    :src="logoUrl"
    :width="size"
    :height="size"
    alt=""
    aria-hidden="true"
    class="shrink-0 object-contain"
  />
</template>
