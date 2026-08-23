<script setup lang="ts">
import { Moon, Sun } from '@lucide/vue'

import { Button } from '@/components/ui/button'
import { useTheme } from '@/composables/useTheme'

const { isDark, toggle } = useTheme()
</script>

<template>
  <Button
    variant="ghost"
    size="icon-sm"
    class="text-muted-foreground hover:text-foreground"
    :aria-label="isDark ? '切换到亮色主题' : '切换到暗色主题'"
    @click="toggle"
  >
    <Moon v-if="isDark" />
    <Sun v-else />
  </Button>
</template>
