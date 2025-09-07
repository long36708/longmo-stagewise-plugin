# Tasks Document

- [ ] 1. Implement selector types in src/core/selector/types.ts
  - File: src/core/selector/types.ts
  - Purpose: Define Candidate, SelectionItem, SelectionGroup, OverlayState, AnchorData, PromptContext 等核心类型
  - Refs: R1–R5, A–E
  - Acceptance: TS 编译通过，类型可被其他模块导入复用

- [ ] 2. Add selector constants in src/core/selector/constants.ts
  - File: src/core/selector/constants.ts
  - Purpose: 定义类名前缀、稳定性阈值(0.8)、黑名单类名/随机ID模式等
  - Refs: R1, R2
  - Acceptance: 单元测试可读取常量；不与现有常量冲突

- [ ] 3. Create lightweight EventBus
  - File: src/core/selector/event-bus.ts
  - Purpose: on/off/emit 轻量发布订阅，供内部与对外事件复用
  - Refs: R5, A–E
  - Acceptance: 单测覆盖 on/off/once/顺序与移除后不触发

- [ ] 4. Build candidate generator
  - File: src/core/selector/candidate-generator.ts
  - Purpose: 基于 id/class/attr/path/nth-of-type 生成≥3个候选；过滤低信噪 class/随机 id
  - Refs: R1
  - Acceptance: JSDOM 下对目标元素生成≥3个候选，唯一性可测

- [ ] 5. Implement selector scorer and fallback
  - File: src/core/selector/scorer.ts
  - Purpose: 计算唯一性/稳定性/特异性，按分数排序；失配时回退到下一高分
  - Refs: R1
  - Acceptance: 阈值0.8生效；回退顺序正确；边界用例稳定

- [ ] 6. Implement selection state manager
  - File: src/core/selector/selection-state.ts
  - Purpose: 管理悬停/激活/多选集合与候选池；派发 selection-change/candidates-updated
  - Refs: R3–R5
  - Acceptance: 多选增删顺序稳定；复制选择器返回预期

- [ ] 7. Keyboard navigator
  - File: src/core/selector/keyboard-navigator.ts
  - Purpose: 上下左右父/子/兄弟导航；Enter 锁定；Esc 清空；Shift+Up 逐级上行
  - Refs: R3
  - Acceptance: 覆盖全部按键路径与钳制；输入态可配置忽略

- [ ] 8. Overlay renderer shell
  - File: src/core/selector/overlay/overlay-renderer.ts
  - Purpose: sw-ovl-root 容器与子层（边框/遮罩/信息气泡/编号徽标/测量线壳）；rAF 驱动
  - Refs: R2, R5
  - Acceptance: 指针穿透、z-index 正确；移动中帧预算≤16ms（烟测）

- [ ] 9. Measurement engine (Alt)
  - File: src/core/selector/overlay/measurement-engine.ts
  - Purpose: 最近边缘距离计算，渲染细线与标签；支持开关
  - Refs: R2
  - Acceptance: 集成测校验水平/垂直距离正确

- [ ] 10. Integration bridge
  - File: src/core/selector/integration-bridge.ts
  - Purpose: 外发 preview-start/apply/revert、anchor-degraded、screenshot-mode-change；导出/导入锚点；提供快照/Prompt 上下文
  - Refs: A–E, R5
  - Acceptance: 事件负载格式与导入导出 JSON 通过桩测试

- [ ] 11. CSS sanitize utility
  - File: src/utils/css-sanitize.ts
  - Purpose: sanitizeCss(css,{ stripImportant, restrictToSelectors })；检测第三方动画类并返回 warnings
  - Refs: D, E
  - Acceptance: 单测覆盖 !important 剥离/范围限制/动画警告

- [ ] 12. Public API (SelectorEngine)
  - File: src/core/selector/SelectorEngine.ts
  - Purpose: 暴露 enable/disable/setSelectionMode/getCandidates/copySelector/getOverlaySnapshotContext/on/off/getPromptsContext/sanitizeCss
  - Refs: R1–R5, A–E
  - Acceptance: 集成测通过完整交互链路

- [ ] 13. Export entry updates
  - File: src/index.ts
  - Purpose: 导出 SelectorEngine 与相关类型/工具，保持现有导出兼容
  - Refs: R5
  - Acceptance: 构建通过，消费方可命名导入

- [ ] 14. Unit test: candidate generator
  - File: tests/unit/selector/candidate-generator.test.ts
  - Purpose: 候选≥3与过滤规则验证
  - Refs: R1
  - Acceptance: 测试通过

- [ ] 15. Unit test: scorer
  - File: tests/unit/selector/scorer.test.ts
  - Purpose: 阈值0.8与回退策略验证
  - Refs: R1
  - Acceptance: 测试通过

- [ ] 16. Unit test: keyboard navigator
  - File: tests/unit/selector/keyboard-navigator.test.ts
  - Purpose: 全按键路径与钳制
  - Refs: R3
  - Acceptance: 测试通过

- [ ] 17. Unit test: css-sanitize
  - File: tests/unit/utils/css-sanitize.test.ts
  - Purpose: !important 剥离与范围限制、动画警告
  - Refs: D, E
  - Acceptance: 测试通过

- [ ] 18. Integration test: overlay flow
  - File: tests/integration/selector-overlay-flow.test.ts
  - Purpose: 悬停高亮/信息气泡/编号徽标/Alt 测量/preview 事件/截图模式/anchor-degraded
  - Refs: R2, R4, R5, A–C
  - Acceptance: 全链路断言通过、DOM 清理无残留

- [ ] 19. Perf smoke test
  - File: tests/perf/selector-perf.test.ts
  - Purpose: >3000 节点下移动与导航帧时长分布
  - Refs: Performance NFR
  - Acceptance: 中位帧≤8ms；长帧（>50ms）10秒内≤2

- [ ] 20. Documentation
  - File: docs/selector-engine-and-overlay.md
  - Purpose: API、事件协议、安全与集成约束，示例与FAQ
  - Refs: 全部
  - Acceptance: 文档 lint 通过并包含示例
