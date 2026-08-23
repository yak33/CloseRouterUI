import { useLocalStorage, usePreferredDark } from '@vueuse/core'
import { computed, watchEffect } from 'vue'

/**
 * 明暗主题。
 *
 * 刻意不使用 useColorMode：它的 'auto' 在 emitAuto:false 下会把「跟随系统」
 * 和「用户显式选择」压成同一个值回写 storage，导致用户选的 dark 会被系统的
 * light 覆盖。这里把两种状态显式分开 —— system 是一种偏好，不是一个结果。
 *
 * @author ZHANGCHAO
 * @date 2026/08/22
 */
export type ThemePreference = 'light' | 'dark' | 'system'

/** 模块级单例：多个组件调用 useTheme() 共享同一份状态 */
const preference = useLocalStorage<ThemePreference>('closerouter-theme', 'system')
const prefersDark = usePreferredDark()

const isDark = computed(() =>
  preference.value === 'system' ? prefersDark.value : preference.value === 'dark',
)

// 单次注册的全局副作用：偏好或系统设置变化时同步 <html> 的类
watchEffect(() => {
  const root = document.documentElement
  root.classList.toggle('dark', isDark.value)
  root.classList.toggle('light', !isDark.value)
})

export function useTheme() {
  /** 从当前呈现结果取反 —— 用户在 system 态下点击时，得到的一定是可见的变化 */
  const toggle = () => {
    preference.value = isDark.value ? 'light' : 'dark'
  }

  return { preference, isDark, toggle }
}
