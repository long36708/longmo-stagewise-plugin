# 技术决策（Steering · tech.md)

## 技术栈概览
- 语言与框架：TypeScript 5.4 + Vue 3.4
- 构建：Vite 5（库模式），别名 @ -> ./src
- 测试：Vitest（jsdom 环境），@vue/test-utils 2
- 样式：Sass（.vue SFC 中使用，注意 Dart Sass legacy JS API 的弃用提示）
- 打包产物：ES 模块 + UMD，随包发布类型声明（vite-plugin-dts）
- 运行环境：Node >= 18；浏览器为现代主流（不支持 IE）
- 依赖策略：vue 作为 peerDependencies；库自身不内置 Vue

## 关键决策与理由
1. Vue 3 + 组合式 API：提升可组合性与可测试性；核心选择逻辑与 UI 解耦。
2. Vite 库模式：快速构建与优秀的开发体验；同时生成 ES/UMD 以支持多场景集成。
3. 类型声明随包发布：便于 TS 项目消费，保证 API 可发现性（dist/types）。
4. 测试在 jsdom：覆盖引擎、组件与端到端交互，确保在类浏览器环境中可靠运行。
5. 持久化以选择器为主：仅保存可序列化数据，避免持有 DOM 引用导致问题。
6. 错误与性能内建工具：统一错误模型（SelectorError）与轻量性能监测，降低问题定位成本。

## 架构与模块
- components/
  - ElementSelector.vue：交互与可视化面板（启用/禁用、模式切换、错误与状态展示）
  - ElementInfoPanel.vue：元素信息展示（样式、盒模型等）
- composables/
  - useElementSelection.ts：与核心引擎对接的状态与方法封装（启用、清空、模式、持久化）
  - useElementStyles.ts：样式提取与监听（Mutation/Resize Observer）
- core/
  - ElementSelectorEngine.ts：核心选择逻辑（事件、高亮、状态与回调）
  - selection-persistence.ts/SelectionPersistenceManager.ts：状态序列化/反序列化
  - style-extractor.ts：元素样式信息提取
- utils/
  - dom-utils.ts：DOM 工具（节流/去抖、可见性、样式信息提取等）
  - style-utils.ts：样式解析/对比/应用
  - event-utils.ts：委托与热键注册
  - error-handler.ts：错误归一与跨域/样式访问防护
  - performance-monitor.ts：FPS/内存/长任务监测
- types/
  - element-selector.ts：核心类型（SelectorConfig/Events/ElementStyleInfo 等）

## 构建与打包
- 配置文件：vite.config.ts
  - 插件：@vitejs/plugin-vue、vite-plugin-dts
  - externals：将 vue 设为 external；UMD 全局名 Vue
  - 输出：
    - dist/longmo-stagewise-plugin.es.js
    - dist/longmo-stagewise-plugin.umd.js
    - dist/style.css
    - dist/types/**
- 入口：src/index.ts 导出组件、组合式、引擎与类型
- 包入口（package.json）：
  - main: dist/longmo-stagewise-plugin.umd.js
  - module: dist/longmo-stagewise-plugin.es.js
  - types: dist/types/index.d.ts
  - exports: . -> { types/import/require }
  - sideEffects: false（利于 Tree Shaking）

## 测试策略
- 配置：vitest.config.ts（environment: jsdom, globals: true, setupFiles: tests/setup.ts）
- 范畴：
  - 单元：引擎、utils、类型边界
  - 组件：ElementSelector 交互与状态联动
  - 集成：selection-flow 完整流程（选择→展示→持久化→恢复）
- 命令：pnpm test（CI 可用 --run/--coverage）
- 目标：关键路径全绿，回归成本可控（当前 20/20）

## 代码规范
- 语言特性：严格使用 TS，避免 any；类型定义集中在 types/
- 风格：ESLint + eslint-plugin-vue；保持组合式/SFC 一致风格
- 目录与命名：小驼峰/中划线一致；公共工具复用，避免重复实现
- 导入路径：统一使用 @ 别名；测试中若需相对路径，注意与构建保持一致

## 性能与可观测性
- 鼠标悬浮/移动：throttle(~16ms)；避免高频 DOM 读写抖动
- 大页面：限制 maxSelectionCount；监听器按需注册/销毁
- 监测：performance-monitor 提供 FPS/内存/长任务指标与告警回调

## 安全与兼容
- 跨域：遵守同源策略；跨域访问失败通过 SelectorError 捕获与提示
- 机密：不引入任何密钥；不记录敏感信息
- 浏览器：现代浏览器优先；不考虑 IE

## 发布与版本
- 版本：SemVer；变更以变更日志记录（建议新增 CHANGELOG.md）
- 预发布校验：prepublishOnly -> type-check、test、build 全通过
- 分发：pnpm publish（需登录 npm），产物含类型与样式

## 未来演进
- Sass 警告治理：关注 Dart Sass 2.0 变更，必要时调整依赖与用法
- Shadow DOM 与跨 iframe 能力评估
- 更丰富的样式对比与导出能力
