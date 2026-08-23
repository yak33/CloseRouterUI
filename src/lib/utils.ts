import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 合并 Tailwind 类名，后写的同族类覆盖先写的。
 * 所有组件的 class 透传都必须经过它，否则调用方无法覆盖内置样式。
 *
 * @author ZHANGCHAO
 * @date 2026/08/22
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
