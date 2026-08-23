# 融入既有项目

三条路径，按侵入程度从小到大。先确认你的项目满足前置条件，否则会踩坑。

## 前置条件自查

```bash
# 1. Tailwind 版本 —— 必须是 v4
node -e "console.log(require('tailwindcss/package.json').version)"

# 2. Vue 版本 —— 需要 3.5+（用到了 useId、defineModel）
node -e "console.log(require('vue/package.json').version)"
```

**Tailwind 还在 v3 的话，令牌层不能直接搬。** v3 没有 `@theme inline`，
需要改写成 `tailwind.config.js` 的 `theme.extend.colors` + `hsl(var(--x) / <alpha-value>)`
形式。工作量不大但必须做，直接复制会静默失效（所有 `bg-primary` 类都不生成）。

---

## 路径 A：只要视觉（最轻，推荐先试）

适合：你的项目已有自己的组件库，只想换一套配色和质感。

**搬这些：**

```
src/assets/styles/index.css        → 合并进你的全局 CSS
```

**改动点：**

1. 把 `:root` / `.dark` / `@theme inline` 三段整体复制过去
2. 字体三行按需保留，并在入口 import Fontsource：
   ```ts
   import '@fontsource-variable/outfit'
   import '@fontsource-variable/plus-jakarta-sans'
   import '@fontsource-variable/geist-mono'
   ```
   ```bash
   pnpm add @fontsource-variable/{outfit,plus-jakarta-sans,geist-mono}
   ```
3. 确保 `<html>` 上有 `light` / `dark` 类。没有主题切换的话，
   把 `src/composables/useTheme.ts` 和 `index.html` 里的首帧防闪脚本一起搬

**代价：** 你原有组件里写死的颜色（`bg-gray-100`、`text-slate-600` 这类）
不会自动跟着变，得手动替换成语义令牌。这是主要工作量。

---

## 路径 B：视觉 + 组件原语（中等）

适合：新模块或新页面，想直接用这套组件开工。

**在路径 A 基础上再搬：**

```
src/lib/utils.ts                   → cn()
src/components/ui/**               → Button · Badge · Card · TabBar
components.json                    → 让 shadcn-vue CLI 能继续 add
```

**依赖：**

```bash
pnpm add reka-ui class-variance-authority clsx tailwind-merge @lucide/vue
```

**改动点：**

1. `tsconfig` 里配好 `@/*` 路径别名（v6 起不要写 `baseUrl`，已废弃）
2. `vite.config.ts` 加 `resolve.alias`
3. `components.json` 里的 `tailwind.css` 改成你实际的 CSS 路径

**如果你项目里已经有 shadcn-vue：** 组件会冲突。这套的 `Button` / `Card`
在内边距和圆角上做过调整（Card 用 `px-5 pt-4 pb-3` 而非默认值）。
建议先 diff 再决定覆盖还是只取令牌层。

---

## 路径 C：整套外壳（最重）

适合：从零起一个新的后台 / 控制台。

**直接以本项目为起点**，删掉不需要的部分：

```bash
cp -r openrouter-vue my-console
cd my-console
rm -rf .git dist node_modules
pnpm install
```

**然后按顺序清理：**

1. `src/data/mock.ts` —— 换成你的 API 层。视图依赖的是文件里导出的那几个
   TypeScript 类型，保持类型不变就能无痛替换
2. `src/views/**` —— 删掉用不到的页面，同步删 `router/index.ts` 和
   `AppSidebar.vue` 的 nav 数组
3. `src/components/layout/AppTopNav.vue` —— `PRODUCT_LINKS` 换成你的导航
4. `src/components/layout/BrandMark.vue` —— 换成你的 logo
5. `src/assets/styles/index.css` —— 换品牌色（见 AGENTS.md「换皮」一节）

**必须先补的三件事**（见 AGENTS.md「当前状态」）：

- 接上 18 个展示性按钮的实际行为
- 抽一层数据请求封装（现在视图直接 import 同步常量）
- 补 loading / error 态

---

## 常见坑

| 现象 | 原因 |
|---|---|
| 所有 `bg-primary` 类都不生效 | Tailwind 还是 v3，`@theme inline` 不认 |
| `hover:bg-accent/40` 看不出变化 | `accent` 本身就是 7.8% 透明，再乘 40% 等于隐形。用 `accent-subtle` |
| `font-semibold` 不起作用 | 某处写了 `font-variation-settings`，它会压过 `font-weight` |
| 暗色模式首帧闪白 | `index.html` 的防闪脚本没搬，或 storage key 对不上 |
| 表格数字忽宽忽窄 | 忘了给单元格加 `.tabular` |
| CLI 加的组件报错找不到图标 | shadcn-vue CLI 生成的是 `lucide-vue-next`（已废弃），改成 `@lucide/vue` |

---

作者：ZHANGCHAO
