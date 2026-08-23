/**
 * 控制台展示层的格式化工具。
 *
 * 约定：这里的函数只负责「怎么显示」，不含任何业务判断；
 * 阈值类逻辑（比如多少算异常）留在调用方，避免格式化层偷偷夹带规则。
 *
 * @author ZHANGCHAO
 * @date 2026/08/22
 */

const COMPACT = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })
const DECIMAL = new Intl.NumberFormat('en-US')

/** 8_200_000 → "8.2M"，用于 token / 请求数这类量级跨度大的指标 */
export const compact = (value: number): string => COMPACT.format(value)

/** 1204 → "1,204"，用于需要精确读数的场景 */
export const decimal = (value: number): string => DECIMAL.format(value)

/**
 * 金额格式化。两个细节：
 *   1. 低于 1 美元时保留 4 位小数 —— LLM 单次调用成本常在 $0.0003 量级，
 *      粗暴保留 2 位会全部显示成 $0.00；
 *   2. 负号放在货币符号之前（-$63.41），而不是 $-63.41。
 */
export function usd(value: number): string {
  const fractionDigits = Math.abs(value) < 1 && value !== 0 ? 4 : 2
  const sign = value < 0 ? '-' : ''
  return `${sign}$${Math.abs(value).toFixed(fractionDigits)}`
}

/** 每百万 token 单价，模型列表页的标准报价单位 */
export const perMillion = (value: number): string => `$${value}/M`

/** 0.128 → "+12.8%"，正负号始终显式，便于表格里快速扫读 */
export function delta(ratio: number): string {
  const sign = ratio > 0 ? '+' : ''
  return `${sign}${(ratio * 100).toFixed(1)}%`
}

/** 1_000_000 → "1M"，上下文窗口专用（K/M 取整，不出现小数） */
export function contextWindow(tokens: number): string {
  if (tokens >= 1_000_000) return `${Math.round(tokens / 1_000_000)}M`
  return `${Math.round(tokens / 1_000)}K`
}

export const latency = (ms: number): string => `${decimal(Math.round(ms))}ms`
