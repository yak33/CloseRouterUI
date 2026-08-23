export { default as TabBar } from './TabBar.vue'

export interface TabItem {
  value: string
  label: string
  /** 右侧的小计数，没有就不渲染 */
  count?: number
}
