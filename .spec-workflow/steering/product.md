# 产品愿景（Steering · product.md）

## 一、愿景与目标
- 愿景：提供一套轻量、可扩展的网页元素选择与样式洞察能力，帮助前端/设计/QA 在不入侵业务的前提下完成页面微调与信息采集。
- 目标：
  - 低学习成本（即插即用的 Vue 组件 + 组合式 API）
  - 高可用（多选/单选、高亮、键盘操作、错误兜底、持久化）
  - 易集成（库构建、类型声明、示例与文档完整）

## 二、用户与场景
- 目标用户：
  - 前端工程师：联调验证、辅助调试、生成定位选择器
  - 设计/体验工程师：获取样式/尺寸信息，验证规范一致性
  - QA 测试：标注并复现问题元素，持久化选择状态
- 典型场景：
  - 可视化高亮与选择（鼠标悬停/点击）
  - 单/多选切换、批量查看元素信息
  - 复制选择器/样式摘要，做二次分析
  - 持久化选择并在刷新或重装后恢复

## 三、范围（Scope）
- MVP 包含：
  - 选择引擎（ElementSelectorEngine）：事件捕获、高亮、状态管理、模式切换
  - 组件与组合式：ElementSelector.vue、useElementSelection/useElementStyles
  - 工具集：dom-utils/style-utils/event-utils/error-handler/performance-monitor
  - 持久化：仅存可序列化字段，通过选择器恢复
  - 文档与示例：docs/element-selector.md、examples/ElementSelectorDemo.vue
- 非目标（当前不做）：
  - 深度跨域 iframe 选择（受同源策略限制）
  - Shadow DOM 全量特性支持（后续可评估）
  - Canvas/WebGL 层面的像素级命中
  - 旧浏览器（IE 等）兼容

## 四、价值与指标
- 价值：缩短定位/核对元素信息成本，提高调试与协作效率
- 指标（KPI/SLO）：
  - 包规模：ES 构建 < 70KB（gzip 后 < 20KB）
  - 性能：悬停高亮不抖动（16ms 级节流），长任务监测具备告警
  - 覆盖率：关键单测 + 简单集成流均通过（20/20）
  - 易用性：提供完整示例与使用文档

## 五、发布与兼容
- 运行环境：Node >= 18、Vue 3.4+
- 打包形式：ES / UMD，类型声明随包发布（vite-plugin-dts）
- 对外依赖：peerDependencies 仅包含 vue

## 六、风险与对策
- 跨域限制：捕获并通过 SelectorError 上报，提供降级提示
- 大页面性能：节流/去抖、Mutation/ResizeObserver 降噪、上限数量控制
- 结构变更导致恢复失败：采用“最佳努力”策略 + 清晰提示

## 七、里程碑与验收
- 里程碑：
  - 引擎/组件/工具/测试/文档分阶段完成（已完成）
  - 产出：dist ES/UMD + types，示例与文档可用
- 验收：
  - 所有单测通过、示例运行正常、构建产物可被外部项目直接消费
