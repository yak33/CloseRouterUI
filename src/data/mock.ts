/**
 * 控制台演示数据。
 *
 * 全部用确定性伪随机生成（固定种子），保证每次刷新曲线一致 —— 演示型模板里
 * 抖动的图表会让人误以为是实时数据，反而影响判断。
 *
 * 接真实接口时，把本文件替换成 API 层即可，视图层依赖的是下面这几个类型。
 *
 * @author ZHANGCHAO
 * @date 2026/08/22
 */

export type Vendor = 'anthropic' | 'openai' | 'google' | 'meta' | 'mistral' | 'deepseek' | 'qwen' | 'xai'

export interface UsagePoint {
  date: string
  spend: number
  tokens: number
  requests: number
}

export interface ModelUsageRow {
  id: string
  name: string
  vendor: Vendor
  tokens: number
  spend: number
  requests: number
  latencyMs: number
  share: number
}

export interface CatalogModel {
  id: string
  name: string
  vendor: Vendor
  description: string
  contextWindow: number
  promptPrice: number
  completionPrice: number
  modalities: Array<'text' | 'image' | 'audio'>
  weeklyTokens: number
  trend: number[]
  tags: string[]
}

export interface ApiKey {
  id: string
  label: string
  masked: string
  createdAt: string
  lastUsed: string | null
  limitUsd: number | null
  spentUsd: number
  status: 'active' | 'disabled'
}

/** 厂商展示元数据：色值用于列表里的品牌圆点，是密集表格里最省空间的辨识手段 */
export const VENDOR_META: Record<Vendor, { label: string; color: string }> = {
  anthropic: { label: 'Anthropic', color: '#D97757' },
  openai: { label: 'OpenAI', color: '#10A37F' },
  google: { label: 'Google', color: '#4285F4' },
  meta: { label: 'Meta', color: '#0866FF' },
  mistral: { label: 'Mistral', color: '#FA520F' },
  deepseek: { label: 'DeepSeek', color: '#4D6BFE' },
  qwen: { label: 'Qwen', color: '#7C3AED' },
  xai: { label: 'xAI', color: '#8B8B8B' },
}

/** 线性同余发生器，只为让演示曲线「看起来自然」而稳定复现 */
function seeded(seed: number): () => number {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

function buildUsageSeries(days: number): UsagePoint[] {
  const random = seeded(20260822)
  const today = new Date()

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (days - 1 - index))

    // 工作日基线更高，周末回落 —— 让曲线呈现真实的七日节律
    const weekendDamping = [0, 6].includes(date.getDay()) ? 0.55 : 1
    const growth = 1 + index / (days * 2.2)
    const noise = 0.75 + random() * 0.5

    const requests = Math.round(320 * weekendDamping * growth * noise)
    const tokens = Math.round(requests * (1_650 + random() * 900))

    return {
      date: date.toISOString().slice(0, 10),
      requests,
      tokens,
      spend: Number(((tokens / 1_000_000) * (4.1 + random() * 1.6)).toFixed(2)),
    }
  })
}

/**
 * 造 60 天而只展示最近 30 天：环比需要一段等长的「上一周期」做分母，
 * 只造 30 天的话最大档位算出来永远是 0%。
 */
export const usageSeries: UsagePoint[] = buildUsageSeries(60)

function sparkline(seed: number, length = 14): number[] {
  const random = seeded(seed)
  let level = 40 + random() * 30
  return Array.from({ length }, () => {
    level = Math.max(8, Math.min(100, level + (random() - 0.45) * 26))
    return Number(level.toFixed(1))
  })
}

export const modelUsage: ModelUsageRow[] = [
  { id: 'anthropic/claude-opus-5', name: 'Claude Opus 5', vendor: 'anthropic', tokens: 3_142_000, spend: 18.4, requests: 412, latencyMs: 412, share: 0.38 },
  { id: 'openai/gpt-5.2', name: 'GPT-5.2', vendor: 'openai', tokens: 2_048_000, spend: 11.02, requests: 386, latencyMs: 287, share: 0.25 },
  { id: 'google/gemini-3-pro', name: 'Gemini 3 Pro', vendor: 'google', tokens: 1_204_000, spend: 6.18, requests: 241, latencyMs: 331, share: 0.15 },
  { id: 'deepseek/deepseek-v4', name: 'DeepSeek V4', vendor: 'deepseek', tokens: 986_000, spend: 1.44, requests: 198, latencyMs: 604, share: 0.12 },
  { id: 'qwen/qwen3-max', name: 'Qwen3 Max', vendor: 'qwen', tokens: 512_000, spend: 0.92, requests: 122, latencyMs: 448, share: 0.06 },
  { id: 'meta/llama-4-405b', name: 'Llama 4 405B', vendor: 'meta', tokens: 318_000, spend: 0.61, requests: 87, latencyMs: 522, share: 0.04 },
]

export const catalog: CatalogModel[] = [
  {
    id: 'anthropic/claude-opus-5',
    name: 'Claude Opus 5',
    vendor: 'anthropic',
    description: '面向复杂推理与长程 agent 任务的旗舰模型，1M 上下文下仍保持稳定的指令遵循。',
    contextWindow: 1_000_000,
    promptPrice: 3,
    completionPrice: 15,
    modalities: ['text', 'image'],
    weeklyTokens: 84_200_000_000,
    trend: sparkline(101),
    tags: ['reasoning', 'agents', 'long-context'],
  },
  {
    id: 'openai/gpt-5.2',
    name: 'GPT-5.2',
    vendor: 'openai',
    description: '通用能力均衡，工具调用稳定性好，适合大规模生产流量。',
    contextWindow: 400_000,
    promptPrice: 1.25,
    completionPrice: 10,
    modalities: ['text', 'image', 'audio'],
    weeklyTokens: 61_800_000_000,
    trend: sparkline(202),
    tags: ['general', 'tools', 'multimodal'],
  },
  {
    id: 'google/gemini-3-pro',
    name: 'Gemini 3 Pro',
    vendor: 'google',
    description: '超长上下文与原生多模态，视频与文档理解场景性价比突出。',
    contextWindow: 2_000_000,
    promptPrice: 1.25,
    completionPrice: 5,
    modalities: ['text', 'image', 'audio'],
    weeklyTokens: 47_500_000_000,
    trend: sparkline(303),
    tags: ['long-context', 'multimodal', 'vision'],
  },
  {
    id: 'deepseek/deepseek-v4',
    name: 'DeepSeek V4',
    vendor: 'deepseek',
    description: '开放权重 MoE，代码与数学能力接近闭源旗舰，单位成本极低。',
    contextWindow: 256_000,
    promptPrice: 0.27,
    completionPrice: 1.1,
    modalities: ['text'],
    weeklyTokens: 39_100_000_000,
    trend: sparkline(404),
    tags: ['open-weights', 'coding', 'budget'],
  },
  {
    id: 'qwen/qwen3-max',
    name: 'Qwen3 Max',
    vendor: 'qwen',
    description: '中文语料占比高，本地化任务表现优于同价位竞品。',
    contextWindow: 262_144,
    promptPrice: 0.4,
    completionPrice: 1.2,
    modalities: ['text', 'image'],
    weeklyTokens: 22_600_000_000,
    trend: sparkline(505),
    tags: ['open-weights', 'chinese', 'budget'],
  },
  {
    id: 'meta/llama-4-405b',
    name: 'Llama 4 405B',
    vendor: 'meta',
    description: '开放权重稠密模型，可自托管，适合有合规隔离要求的场景。',
    contextWindow: 128_000,
    promptPrice: 0.35,
    completionPrice: 0.4,
    modalities: ['text'],
    weeklyTokens: 18_300_000_000,
    trend: sparkline(606),
    tags: ['open-weights', 'self-host'],
  },
  {
    id: 'mistral/mistral-large-3',
    name: 'Mistral Large 3',
    vendor: 'mistral',
    description: '欧洲区部署友好，函数调用与结构化输出稳定。',
    contextWindow: 131_072,
    promptPrice: 2,
    completionPrice: 6,
    modalities: ['text'],
    weeklyTokens: 9_400_000_000,
    trend: sparkline(707),
    tags: ['tools', 'eu-hosted'],
  },
  {
    id: 'xai/grok-4',
    name: 'Grok 4',
    vendor: 'xai',
    description: '实时信息接入能力强，适合需要时效性的检索增强场景。',
    contextWindow: 256_000,
    promptPrice: 3,
    completionPrice: 15,
    modalities: ['text', 'image'],
    weeklyTokens: 7_800_000_000,
    trend: sparkline(808),
    tags: ['realtime', 'search'],
  },
]

export const apiKeys: ApiKey[] = [
  { id: 'k_01', label: 'production-gateway', masked: 'sk-or-v1-••••••••••••4f2a', createdAt: '2026-03-14', lastUsed: '2026-08-22', limitUsd: 500, spentUsd: 318.42, status: 'active' },
  { id: 'k_02', label: 'staging', masked: 'sk-or-v1-••••••••••••9c17', createdAt: '2026-05-02', lastUsed: '2026-08-21', limitUsd: 100, spentUsd: 12.86, status: 'active' },
  { id: 'k_03', label: 'local-dev / zhangchao', masked: 'sk-or-v1-••••••••••••01be', createdAt: '2026-06-19', lastUsed: '2026-08-20', limitUsd: null, spentUsd: 4.19, status: 'active' },
  { id: 'k_04', label: 'batch-eval-runner', masked: 'sk-or-v1-••••••••••••7d33', createdAt: '2026-01-08', lastUsed: null, limitUsd: 50, spentUsd: 49.5, status: 'disabled' },
]

export interface LogEntry {
  id: string
  timestamp: string
  modelId: string
  modelName: string
  vendor: Vendor
  provider: string
  app: string
  inputTokens: number
  outputTokens: number
  cost: number
  usageType: 'Credits' | 'BYOK'
  speed: number
  duration: number
  cached: boolean
}

const LOG_APPS = ['Zed Editor', 'Claude Code', 'internal-crawler'] as const

function buildLogs(count: number): LogEntry[] {
  const random = seeded(880422)
  const sources = catalog.slice(0, 4)

  return Array.from({ length: count }, (_, index) => {
    const model = sources[Math.floor(random() * sources.length)]
    const minutesAgo = index * 3 + Math.floor(random() * 4)
    const stamp = new Date()
    stamp.setMinutes(stamp.getMinutes() - minutesAgo)

    const inputTokens = Math.round(38_000 + random() * 16_000)
    const outputTokens = Math.round(12 + random() * 1_700)
    const speed = Number((1.5 + random() * 58).toFixed(1))

    return {
      id: `gen_${(index + 1).toString().padStart(3, '0')}`,
      timestamp: stamp.toISOString(),
      modelId: model.id,
      modelName: model.name,
      vendor: model.vendor,
      provider: model.vendor === 'anthropic' ? 'Anthropic' : VENDOR_META[model.vendor].label,
      app: LOG_APPS[Math.floor(random() * LOG_APPS.length)],
      inputTokens,
      outputTokens,
      cost: Number(((inputTokens / 1e6) * model.promptPrice + (outputTokens / 1e6) * model.completionPrice).toFixed(4)),
      usageType: random() > 0.15 ? 'Credits' : 'BYOK',
      speed,
      duration: Number((outputTokens / speed / 60).toFixed(2)),
      cached: random() > 0.35,
    }
  })
}

export const logs: LogEntry[] = buildLogs(16)

/** 日志页顶部的请求量直方图：24 个桶对应过去 24 小时，空桶保留以体现节律 */
export const logVolume: number[] = (() => {
  const random = seeded(770311)
  return Array.from({ length: 24 }, (_, hour) => {
    const idle = hour < 6 || (hour > 13 && hour < 18)
    return idle ? Math.round(random() * 3) : Math.round(6 + random() * 34)
  })
})()
