# Design Document

## Overview
为“selector-engine-precision-and-overlay”提供技术方案：在真实页面中实现精准、稳健、低开销的元素选择体验与可视化覆盖层（高亮、测量、辅助线），并以清晰的API与事件与其他模块（历史/评论锚点/截图/AI/安全）解耦协作。

## Scope
- In: 选择器候选生成与评分、键盘导航、覆盖层渲染与测量线、与预览通道的选择器联动、集成事件与数据接口。
- Out: 历史栈UI/渲染、评论系统UI/存储、截图工具实现、AI请求/密钥管理与第三方库加载策略（均通过接口协作）。

## Architecture
模块划分（SRP）：
- SelectorCandidateGenerator：生成候选选择器（id/class/attr/hierarchy/nth-of-type 等）。
- SelectorScorer：唯一性/稳定性评分与回退策略。
- SelectionState：当前悬停/激活/多选集合与候选池、组编号管理。
- KeyboardNavigator：父/子/兄弟导航与锁定/清空。
- OverlayRenderer：覆盖层容器与层级：border/mask/label/badges/measure-lines；rAF绘制。
- MeasurementEngine：邻近元素测量（Alt触发）与对齐辅助线。
- IntegrationBridge：对外事件与数据提供（history/comments/screenshot/AI/security）。
- EventBus：内部事件通道（轻量发布订阅）。

## Data Model & Types（TS 伪代码）
- type Candidate = { selector: string; strategy: 'id'|'class'|'attr'|'path'|'nth'; uniqueness: number; stability: number; specificity: number; depth: number; features?: Record<string, any> };
- type SelectionItem = { el: Element; rect: DOMRectReadOnly; candidates: Candidate[]; chosen?: Candidate };
- type SelectionGroup = { items: SelectionItem[]; order: number[] };
- type OverlayState = { activeRect?: DOMRectReadOnly; badges: Array<{rect: DOMRectReadOnly; index: number}>; measure?: { lines: Array<{x1:number;y1:number;x2:number;y2:number;label:string}> } };
- type AnchorData = { selectorCandidates: string[]; stabilityScore: number; rect: {x:number;y:number;width:number;height:number}; textSnippet?: string; domPath: string };
- type PromptContext = { tag: string; id?: string; classList: string[]; inlineStyle?: Record<string,string>; computedStyleTopN: Array<[string,string]>; parentTagPath: string; rootCssVarsExcerpt: Record<string,string> };

## Public API（核心）
- enable(): void / disable(): void
- setSelectionMode(mode: 'single'|'multiple'): void
- getCandidates(el?: Element): Candidate[]
- copySelector(options?: { group?: boolean }): Promise<void>
- getOverlaySnapshotContext(): { activeRect?: DOMRectReadOnly; badges: Array<{rect:DOMRectReadOnly;index:number}>; measure?: OverlayState['measure'] }
- on(event, handler) / off(event, handler)
- sanitizeCss(css: string, options?: { stripImportant?: boolean; restrictToSelectors?: string[] }): { css: string; warnings: string[] }
- getPromptsContext(limit?: { styles?: number; vars?: number }): PromptContext

## Events（外发）
- 'hover-change': { el?: Element; rect?: DOMRectReadOnly }
- 'selection-change': { group: SelectionGroup; chosen?: Candidate }
- 'candidates-updated': { el: Element; candidates: Candidate[] }
- 'preview-start'|'preview-apply'|'preview-revert': { selectors: string[]; cssBefore?: string; cssAfter?: string; timestamp: number; source: 'selector-overlay'; groupId?: string }
- 'anchor-degraded': { reason: string; previous: Candidate; next?: Candidate; hints?: Record<string,any> }
- 'screenshot-mode-change': { enabled: boolean }
- 'warnings': { list: string[] }

## Selector Generation & Scoring
- 生成：
  - id 直达：#id（过滤动态/不稳定id模式，如含随机前后缀）。
  - class 组合：筛选“信噪比高”的类（排除通用类，如 container,row,col,clearfix 等可通过黑名单/词频规则过滤）。
  - 属性：data-*/aria-*/role 等稳定属性；必要时使用 [name="x"][type="y"].
  - 层级路径：父链 + nth-of-type，深度限制，避免过长路径。
- 唯一性：document.querySelectorAll(selector).length === 1 计为 1.0，否则按 1/n 衰减。
- 稳定性：
  - 特征：是否使用数据属性、类名是否包含随机片段、是否依赖易变位置、深度/兄弟序波动风险。
  - 评分：加权合成到 0~1；设阈值 0.8 作为“稳健”判定。
- 回退：当前候选不唯一/不命中时，按分数降序回退到下一候选；触发 'anchor-degraded'。

## Overlay Rendering
- DOM 结构：
  - 容器：<div class="sw-ovl-root" aria-hidden="true" role="presentation" /> 固定定位；z-index: 2147483640；pointer-events: none。
  - 层：边框（4边线+角标）、半透明遮罩、信息气泡（tag#id.class，尺寸，z-index，简路径）、组编号徽标、测量线层。
- 性能：
  - rAF 合帧；mousemove/scroll/resize/keydown 节流/去抖；布局读取（getBoundingClientRect/computedStyle）做缓存，跨帧过期。
  - 更新预算 16ms；节点数≤5；文本测量最小化；信息气泡采用 transform/translate 避免回流。
- 可达性：
  - 高对比度主题；ARIA 隐藏但不干扰辅助技术；键盘可控。

## Measurement Engine（Alt 触发）
- 邻近元素命中：通过 elementFromPoint 邻域扫描与父容器内子项边界集合，取最近边缘，计算水平/垂直距离。
- 渲染：细线+标签（px），随光标更新；可开关。

## Keyboard Navigation
- Up/Down/Left/Right → 父/子/前兄弟/后兄弟；根/末端钳制。
- Enter 锁定当前选择（冻结候选更新）；Esc 清空。
- 修饰键：Shift+Up 逐级上行；Cmd/Ctrl+Click 多选增删。

## Integration Contracts
A. 历史与CSS Diff
- 事件：preview-start/apply/revert；payload 含 selectors/cssBefore/cssAfter/timestamp/source/groupId。
- 请求 diff：getDiffForSelection(): { added: Map<string,string>; modified: Array<{prop:string; before:string; after:string}>; removed: string[] }（由上层或 style-utils 计算，本模块提供选区限定与快照上下文）。

B. 评论智能锚点
- 暴露 AnchorData：{ selectorCandidates[], stabilityScore, rect, textSnippet, domPath }。
- 降级事件：'anchor-degraded' with hints；reanchor(hints) 由上层调用后本模块刷新候选。
- 导入导出：exportAnchors()/importAnchors() JSON（版本号与前向兼容字段）。

C. 截图与标注
- screenshotMode(true/false) → 覆盖层切到高对比度/精简描边，确保 html2canvas 可抓取。
- getOverlaySnapshotContext() 返回当前可叠加到画布的几何/标记数据。
- 第三方失败时确保状态可恢复且无残留节点。

D. AI/传统CSS生成
- getPromptsContext(limit) 提供受限字段规模的上下文；
- sanitizeCss(css, { stripImportant, restrictToSelectors }) 输出净化后CSS与warnings；
- 第三方动画类依赖检测 → 'warnings' 事件提示，不主动加载外链。

E. 安全与密钥
- 不处理密钥；日志脱敏（截断选择器/文本片段）。
- CSS/DOM 隔离：类前缀 sw-ovl-；不改动页面持久样式。
- 事件速率限制，遵循 CSP，不注入外部脚本/样式。

## Error Handling
- 跨域 iframe/closed shadowRoot → 降级提示；
- 选择器评估失败 → 回退候选并事件通知；
- 覆盖层绘制异常 → 自动清理容器并记录一次性 warning。

## Performance Targets
- 悬停连续移动：中位帧 ≤ 8ms；10秒内长帧 ≤ 2。
- 大页（>3000 节点）下保持交互流畅，无明显抖动。

## Testing Strategy
- 单测：候选生成/评分/回退；键盘导航边界；sanitizeCss。
- 组件/集成测：覆盖层渲染更新、测量线显示；事件协议与外部模块桩。
- 性能烟测：jsdom + 伪造大DOM树，采样帧时长与事件频率。

## Migration & Compatibility
- 与现有 useElementSelection/ElementSelectorEngine 对齐：逐步替换内部实现，API 外观保持兼容；新增事件为可选订阅。

## Risks & Mitigations
- 复杂页面类名噪声大 → 引入词频黑名单与特征评估；
- 性能压力 → 单容器少节点、合帧与缓存；
- 选择器脆弱 → 候选池+稳定性评分与自动回退。
