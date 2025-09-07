# Requirements Document

## Introduction
本规格旨在为网页微调插件提供“精准元素选择与可视化覆盖层”的能力，面向产品/前端在真实页面中快速、稳健地选中目标元素，生成稳定选择器，并以低开销的高亮/测量覆盖层呈现结构信息与距离辅助，从而更高效地预览与应用CSS修改。

## Alignment with Product Vision
该能力与“所见即所得的微调体验”目标一致：提升选择可靠性与可理解性，缩短从观察→选中→预览→应用的闭环时间，减少因选择器不稳导致的返工。

## Requirements

### Requirement 1: 精准选择器生成与稳定性评分
**User Story:** 作为使用微调插件的前端/产品，我希望为任意选中元素生成多个候选CSS选择器并给出稳定性评分，以便选择最稳健的方案并复制使用。

#### Acceptance Criteria
1. WHEN 用户悬停或点击某元素 THEN 系统 SHALL 计算≥3个候选CSS选择器（如基于id/类名/层级/nth-of-type/属性组合），并给出0~1的唯一性/稳定性评分，默认选中匹配唯一元素的最高分候选。
2. IF 当前选中候选在DOM轻微变更后不再唯一或不匹配 THEN 系统 SHALL 自动回退到下一高分且分数≥0.8的候选，并提示用户确认或手动切换候选。
3. WHEN 用户点击“复制选择器” THEN 系统 SHALL 将当前候选的纯CSS选择器复制到剪贴板并显示成功气泡。

### Requirement 2: 可视化覆盖层与测量
**User Story:** 作为用户，我希望在选中/悬停元素时看到清晰的可视化覆盖层，包括盒模型信息与对齐/间距提示，以帮助我进行像素级微调判断。

#### Acceptance Criteria
1. WHEN 元素处于激活态 THEN 覆盖层 SHALL 绘制边框/半透明遮罩，并显示盒模型（content/padding/margin）分区提示、元素信息气泡（tag#id.class、尺寸、z-index、简要路径）。
2. WHEN 鼠标移动或键盘导航切换元素 THEN 覆盖层 SHALL 在16ms预算内更新，不引起布局抖动或可感知卡顿（10秒内长帧≤2次）。
3. WHEN 按住 Alt 并靠近相邻元素边缘 THEN 系统 SHALL 显示对齐辅助线与边距数值（px），支持水平/垂直方向。

### Requirement 3: 键盘导航与节点路径
**User Story:** 作为用户，我希望通过键盘在DOM中高效导航并锁定所需节点，以减少鼠标依赖并提升定位效率。

#### Acceptance Criteria
1. WHEN ArrowUp THEN 系统 SHALL 选中父节点；WHEN ArrowDown THEN 选中第一个子节点（存在时）；WHEN ArrowLeft THEN 选中前一兄弟；WHEN ArrowRight THEN 选中后一兄弟。
2. WHEN Shift+ArrowUp 连续执行 THEN 系统 SHALL 逐级上行直至<html>，并在根处钳制不再上行。
3. WHEN Enter THEN 系统 SHALL 锁定当前选择；WHEN Esc THEN 清空选择与覆盖层；所有状态切换均与覆盖层实时同步。

### Requirement 4: 多选与分组标记
**User Story:** 作为用户，我希望能多选多个相似元素并生成组合选择器，以便批量预览/应用样式。

#### Acceptance Criteria
1. WHEN Cmd/Ctrl+Click 某元素 THEN 系统 SHALL 将该元素加入/移出当前选择集合，并保持加入顺序。
2. WHEN 存在多个已选元素 THEN 系统 SHALL 为每个元素显示小型编号徽标，并绘制群组外框；点击“复制选择器(组)”返回逗号分隔的选择器列表（不引入:has等实验语法）。

### Requirement 5: 与预览/应用流程的集成
**User Story:** 作为用户，我希望选择器变化能自动联动到预览/应用通道，确保所见即所得。

#### Acceptance Criteria
1. WHEN 当前选择/候选发生变化 THEN 预览流水线 SHALL 接收选择器并仅对命中的元素作用预览样式，不污染其他节点。
2. IF 预览已开启 THEN 覆盖层 SHALL 始终显示在页面内容之上，不与预览样式发生视觉冲突或层级遮挡。

## Integration & Extended Requirements（与其他能力的集成与扩展）

> 说明：以下需求聚焦“选择器与覆盖层”与其它能力的接口/事件/数据约束，便于跨模块协作；具体功能实现归属各自规格。

### A. 与撤销/重做与CSS差异对比（undo-redo-history-and-css-diff）的集成
**User Story:** 作为用户，我希望预览/应用/回退操作形成统一历史，并能查看与当前选择相关的CSS差异。

#### Acceptance Criteria
1. WHEN 发生 previewStart/previewApply/previewRevert THEN 本模块 SHALL 触发可订阅事件并携带 payload：{ selectors, cssBefore, cssAfter, timestamp, source: 'selector-overlay', groupId }，供历史栈记录。
2. WHEN 上层执行 undo/redo THEN 覆盖层 SHALL 根据事件载荷恢复/更新高亮与测量展示，不残留失效态。
3. WHEN 请求当前选择的diff数据 THEN API SHALL 返回{ added, modified, removed }的结构化集合（属性级别），用于差异高亮；本模块不负责渲染diff UI。

### B. 与评论智能定位（comments-smart-anchoring）的集成
**User Story:** 作为用户，我希望评论能随DOM变化保持定位稳定，并在锚点退化时获得提示与修复能力。

#### Acceptance Criteria
1. WHEN 元素被选中 THEN 模块 SHALL 暴露 anchor 数据：{ selectorCandidates[], stabilityScore, rect, textSnippet, domPath }。
2. IF 最优选择器失效 THEN 系统 SHALL 回退至下一候选并触发 'anchor-degraded' 事件，包含原因与建议；提供 reanchor(hints) API 支持半自动修复。
3. WHEN 调用 exportAnchors/importAnchors THEN SHALL 以JSON进行导出/导入，字段与版本可前向兼容。

### C. 与截图与标注（screenshot-and-annotation）的集成
**User Story:** 作为用户，我希望截图能包含覆盖层标记/测量信息，形成所见即所得证据。

#### Acceptance Criteria
1. WHEN 进入截图模式 THEN 覆盖层 SHALL 提供 screenshotMode（精简描边/高对比度），并保证可被html2canvas类工具正确绘制。
2. WHEN 生成截图上下文 THEN API SHALL 提供 getOverlaySnapshotContext()，包含当前选中元素的rect/辅助线/编号标记，供外部叠加到画布。
3. IF 第三方截图失败 THEN 本模块状态 SHALL 可恢复且不遗留DOM节点；不直接负责多CDN/回退，仅需不干扰其策略。

### D. 与AI/传统CSS生成（ai-css-generation-refactor）的集成
**User Story:** 作为用户，我希望AI能基于所选元素上下文生成更准确的CSS，同时保障安全与可控范围。

#### Acceptance Criteria
1. WHEN 外部请求 promptsContext THEN API SHALL 返回结构化上下文：{ tag, id, classList, inlineStyle, computedStyleTopN, parentTagPath, rootCssVarsExcerpt }，并控制字段规模（可配置上限）。
2. WHEN 应用AI返回的CSS到预览 THEN 模块 SHALL 先进行选择器命中范围检查（限定当前选择集合），并提供 sanitizeCss(options) 以剥离危险/越权声明（如无关全局选择器、可选去除!important）。
3. WHEN 检测到依赖第三方动画类/库 THEN 模块 SHALL 返回 warnings 列表，不主动加载外链。

### E. 安全与密钥治理（security-and-api-key-management）约束
**User Story:** 作为用户/管理员，我希望选择器与覆盖层模块在安全边界内运行，不触碰密钥、不引入外链安全风险。

#### Acceptance Criteria
1. 本模块 SHALL 不处理API密钥；日志 SHALL 脱敏（选择器/文本截断）。
2. 覆盖层样式 SHALL 使用前缀（如 sw-ovl-）并与页面隔离；不对页面持久样式做修改。
3. 不注入外部脚本/样式；遵循CSP；事件速率限制以防滥用与指纹化。

## Non-Functional Requirements

### Code Architecture and Modularity
- SRP：选择器计算、覆盖层渲染、键盘导航解耦为独立模块，提供清晰接口与类型。
- 可扩展：评分规则、候选生成策略可插拔；覆盖层渲染支持主题/样式参数化。

### Performance
- rAF 驱动绘制，避免同步强制重排；覆盖层DOM节点数≤5，事件监听与计算节流/去抖。
- 在包含>3000节点的大页中，悬停移动期间CPU占用可控，帧时间中位数≤8ms。

### Security
- 不引入远程执行；覆盖层样式隔离（使用独立容器与前缀类）；不对页面原生样式做持久修改。

### Reliability
- DOM轻微变化时保持选择器可恢复；跨域iframe不在本期范围，遇到shadow DOM（closed）时降级提示。

### Usability
- 覆盖层高对比度与可达性（A11y）：键盘可操作、ARIA友好；文案可国际化；提供可关闭的辅助线/数值显示。
