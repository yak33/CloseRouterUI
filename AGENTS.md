# AGENTS.md

给接手本项目的 AI 与工程师。先读「不可违反的约定」一节，那里面每一条都是踩过的坑。

## 这是什么

一套**设计系统 + 控制台外壳**，视觉语言参考自 [OpenRouter](https://openrouter.ai/)：
令牌数值逐个取自其生产环境 CSS 的 `:root` / `.dark` 块，不是目测调色。
本项目为独立开源作品，与 OpenRouter 官方无任何关联。

定位是**样式底座与布局模板**，不是可上线的产品。业务数据全部来自 `src/data/mock.ts`。

## 命令

```bash
pnpm dev        # 开发服务器
pnpm build      # vue-tsc 类型检查 + 生产构建（类型不过则构建失败）
pnpm preview    # 预览构建产物
```

**没有配 lint / test。** 提交前的唯一门禁是 `pnpm build`，它会跑 `vue-tsc -b`。

## 不可违反的约定

### 1. 不要为「选中/悬浮」写 `dark:` 变体

令牌层已经吸收了明暗差异：

```css
--accent:            hsl(<primary> / 0.078);   /* 选中底色 */
--accent-foreground: hsl(<primary>);           /* 选中文字色 */
--accent-subtle:     hsl(<primary> / 0.031);   /* 悬浮底色 */
```

亮色下 `primary` 是紫 `#7624F4`，暗色下是柠檬绿 `#C8FF00`。所以：

```vue
<!-- 对 -->
<a class="hover:bg-accent-subtle data-[active]:bg-accent data-[active]:text-accent-foreground">

<!-- 错：手写变体等于把令牌层的活又干了一遍，且必然漏掉某个状态 -->
<a class="bg-indigo-50 dark:bg-lime-950 text-indigo-600 dark:text-lime-400">
```

全项目当前 `dark:` 变体数量应为 **0**（`html` 上的 `scheme-light dark:scheme-dark` 除外）。
新增了就说明令牌抽象漏了一层，应该回头补令牌而不是补变体。

### 2. 不要在已经半透明的令牌上再叠透明度

`accent` / `muted` / `border` / `input` **本身就带 alpha**：

| 令牌 | 实际值 |
|---|---|
| `--accent` | primary 的 7.8% |
| `--accent-subtle` | primary 的 3.1% |
| `--border` / `--input` | foreground 的 7.8% |
| `--muted` | foreground 的 3.1% |
| `--muted-foreground` | foreground 的 69%（亮）/ 62.7%（暗） |

所以 `bg-accent/40` = 7.8% × 40% = **3.1%，肉眼几乎不可见**。
需要更轻的层次时用 `accent-subtle`，不要写 `/40`。

`primary` / `foreground` / `destructive` / `success` 是不透明的，可以正常叠透明度。

### 3. 字重必须用 `font-weight`，不能用 `font-variation-settings`

`body` 的 `font-weight: 450` 是可变字体特性。若改成
`font-variation-settings: 'wght' 450`，它会**压过所有 `font-medium` / `font-semibold`
工具类**，全站字重层次静默失效，而且不报错。

### 4. `.tabular` 不切等宽字体

```css
.tabular { font-variant-numeric: tabular-nums; }   /* 仅此而已 */
```

表格数字仍走正文字体（Plus Jakarta Sans）。加 `font-mono` 会让数字列和文字列的
字形割裂。等宽体（Geist Mono）只用于密钥、代码 —— 那种地方显式写 `font-mono`。

### 5. 不要用 PowerShell 批量改写源文件

`Get-Content -Raw` 在中文 Windows 上按 GBK 解码 UTF-8 文件，会把中文烧成乱码，
且**写回后不可逆**。本项目曾因此损坏 7 个视图文件。

批量替换请用 Edit 工具，或 `[System.IO.File]::ReadAllText/WriteAllText`
（默认 UTF-8）。改完用这条自查：

```powershell
# 检测原理：UTF-8 的字节 0x80 被 CP936 解码后会变成 U+20AC（欧元符号），而
# 「一」「—」「，」这类高频中文字符的 UTF-8 编码里都含 0x80，所以损坏必然带出它。
# U+FFFD 则是解码失败的替换符。干净的中文源文件里这两个字符都不该出现。
$signals = [char]0x20AC, [char]0xFFFD
Get-ChildItem -Recurse -Include *.vue,*.ts -Path src | ForEach-Object {
  if ([System.IO.File]::ReadAllText($_.FullName).IndexOfAny($signals) -ge 0) { $_.FullName }
}
```

## 架构

三层，改样式只动最底层：

```
令牌层  src/assets/styles/index.css   全部颜色 / 字体 / 圆角。换皮只改这个文件
原语层  src/components/ui/**          Button · Badge · Card · TabBar（CVA 变体）
场景层  src/views/** + components/console/**   业务页面，只消费上面两层
```

```
src/
├── assets/styles/index.css   # ← 换皮唯一入口
├── components/
│   ├── ui/                   # shadcn-vue 目录约定，CLI 可继续 add
│   │   ├── button/  badge/  card/
│   │   └── tabs/             # 下划线式标签栏，基于 Reka Tabs
│   ├── layout/               # AppShell · AppTopNav · AppSidebar · ThemeToggle · BrandMark
│   ├── charts/               # UsageChart 面积图 · StackedBars 堆叠柱
│   │                         # BarSeries 直方图 · Sparkline 行内趋势
│   └── console/              # PageHeader · StatCard · RankList
├── composables/useTheme.ts   # 主题状态机
├── lib/{utils,format,curve}.ts
├── data/mock.ts              # 接真实 API 时替换此文件
├── views/                    # Activity · Models · Chat · Logs · Keys · Credits · Settings
└── router/index.ts
```

### 布局骨架

```
AppShell
├── AppTopNav          h-16 通栏，跨工作区的产品级导航
└── flex
    ├── AppSidebar     w-240px（折叠 60px），工作区内导航
    └── main           齐边通栏，px-5 py-6，无 max-width 居中
        └── RouterView
```

页面标题**不在顶栏**，由各页自己的 `<PageHeader>` 声明。顶栏留给跨页面导航。

### 主题状态机

`useTheme()` 是三态：`light | dark | system`，持久化在 `localStorage['closerouter-theme']`。

**不要换回 `@vueuse/core` 的 `useColorMode`** —— 它的 `auto` 在 `emitAuto: false` 下会
把「跟随系统」和「用户显式选择」压成同一个值回写 storage，导致用户选的 dark 被系统的
light 覆盖。这个 bug 已经犯过一次。

`index.html` 里有段首帧防闪脚本，读的是同一个 storage key。**改 key 或改取值语义时
两处必须同步**，否则暗色用户会看到一闪白屏。

## 怎么往下做

### 加一个页面

1. `src/views/XxxView.vue`，第一个元素是 `<PageHeader title="..." description="...">`，
   右侧操作放 `#actions` 具名插槽
2. `src/router/index.ts` 注册路由，**必须写 `meta.title`**
3. `AppSidebar.vue` 的 `workspace` 或 `account` 数组里加一项

页面根元素惯例是 `<div class="space-y-5">`，容器留白由 AppShell 统一提供，页面不要自己加 `px-*`。

### 加一个 UI 原语

沿用 shadcn-vue 目录约定：`ui/<name>/<Name>.vue` + `ui/<name>/index.ts`
（变体用 CVA 定义在 `index.ts`，组件从 `.` 导入）。

或者直接用 CLI（`components.json` 已配好）：

```bash
npx shadcn-vue@latest add dialog dropdown-menu tooltip
```

⚠️ CLI 生成的组件可能 import `lucide-vue-next`（**已废弃**）。
加完后全局搜一下改成 `@lucide/vue`。

### 加一个图表

不要引图表库。现有四个组件覆盖了大部分场景：

| 组件 | 用途 |
|---|---|
| `UsageChart` | 单序列面积图，带 hover 十字线与 tooltip |
| `StackedBars` | 按日堆叠柱 + 图例 |
| `BarSeries` | 单序列直方图 |
| `Sparkline` | 行内趋势线，塞进表格行或卡片 |

颜色一律走 CSS 令牌（`var(--color-primary)`、`var(--chart-*)`），
这样主题切换零适配。曲线平滑用 `lib/curve.ts` 的 `monotonePath()` ——
单调插值，不会像 Catmull-Rom 那样在陡峭转折处过冲到负值。

### 换皮成自己的品牌

只改 `src/assets/styles/index.css`：

1. `:root` 和 `.dark` 里的 `--primary` 换成品牌色
2. `--accent` / `--accent-subtle` / `--secondary` / `--ring` 跟着换成同一个色相
   （保持 `/ 0.078` 和 `/ 0.031` 的比例）
3. 字体改 `@theme inline` 里的 `--font-brand` / `--font-sans`，
   并同步 `src/main.ts` 的 Fontsource import

其它文件一律不用动。

## 代码风格

- 中文注释，注释**意图**不注释操作。`// 循环遍历列表` 这种直接删
- 公开函数写 Javadoc 风格块注释，`@author ZHANGCHAO`，日期 `yyyy/MM/dd`
- 类名透传一律经过 `cn()`（`lib/utils.ts`），否则调用方无法覆盖内置样式
- 组件 props 里显式声明 `class?: HTMLAttributes['class']`，走 `cn()` 合并
- 长 class 串抽成 `const ITEM_BASE = '...'` 常量放 `<script setup>` 顶部，
  别在模板里堆三行
- 不为单一实现抽接口，不搞 Policy / Registry / Pipeline 这类模式化抽象

## 当前状态：哪些没做

**作为样式模板是完整的**（6 个页面全部有真实内容与可用交互，明暗双主题，
类型检查零错误，构建 exit 0）。**作为可上线产品不完整**，缺口如下：

| 缺口 | 说明 |
|---|---|
| **26 个按钮里 18 个没接行为** | 刷新、筛选、更多操作、新建密钥、复制、保存、账户菜单、工作区切换、发送消息等都是展示性的 |
| 无数据层 | 没有 fetch / 请求封装 / 错误重试。`data/mock.ts` 是同步常量 |
| 无状态管理 | 没装 Pinia。跨页共享状态目前只有 `useTheme` 这种模块级单例 |
| 无认证 | 没有登录、路由守卫、token 刷新 |
| 无 lint / test | 没有 ESLint / Prettier / Vitest。`lib/curve.ts` 和 `lib/format.ts` 是纯函数，最适合先补测试 |
| 加载/错误态缺失 | 只有 `RankList` 和 `ModelsView` 有空状态，没有 skeleton、没有错误边界 |
| 无 i18n | 中英文硬编码混排（页面标题英文、说明文字中文） |
| 无响应式移动端验证 | 断点写了但没在真机/窄屏上验证过 |

排优先级的话：**接按钮行为 → 抽数据层 → 补 loading/error 态 → lint/test**。

## 融入既有项目

见 [docs/INTEGRATION.md](docs/INTEGRATION.md)。简述：只想要视觉就抄
`index.css` + `components/ui`；想要整套外壳就把 `components/layout` 一起搬，
但要先确认你的项目已经在 Tailwind v4 上。
