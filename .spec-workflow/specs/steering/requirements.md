# Steering 规格 · Requirements

## 1. 摘要
为本项目建立标准化的 Steering 文档体系与审批流，确保产品愿景（product.md）、技术决策（tech.md）、代码结构（structure.md）三类指导文档可被创建、审批、维护与查询，并纳入规范化工作流（spec-workflow）以便协作与追踪。

## 2. 背景与动机
- 已存在的 Steering 指导文档对齐了产品与技术方向，但缺少“规格层面”的需求定义与验收标准，难以统一团队期望与协作节奏。
- 将 Steering 指导文档纳入规格流程，可明确职责分工、标准化审批与更新机制，降低沟通成本与偏差。

## 3. 目标（Goals）
- G1: 定义 Steering 文档的生成位置、命名、模板约束与审批流（Dashboard 审批）。
- G2: 在“规格系统”中引入名为 steering 的规格，覆盖 requirements → design → tasks 的完整阶段。
- G3: 提供可审计的变更流程：创建、审批、更新、清理审批记录。
- G4: 与已完成的 element-selector 规格共存，不影响其构建、测试与发布流程。

## 4. 非目标（Non-Goals）
- NG1: 不强制定义 Steering 文档的具体内容细节（内容由模板与负责人确定）。
- NG2: 不设计跨仓库/多仓库协同机制。
- NG3: 不实现新的可视化 UI，沿用现有 Dashboard 与 CLI 工具。

## 5. 角色与用户故事（User Stories）
- 作为 Tech Lead，我希望能一键创建三类 Steering 文档并发起审批，以便团队达成一致。
- 作为开发者，我希望能随时查看 Steering 文档并知晓其是否已审批通过。
- 作为维护者，我希望更新 Steering 文档后能重新触发审批并保留可追踪记录。

## 6. 功能性需求（Functional Requirements）
- FR1: 文档位置与命名
  - 目录：.spec-workflow/steering/
  - 文件：product.md、tech.md、structure.md
- FR2: 模板
  - 使用 spec-workflow 提供的 steering 模板指引创建/更新内容。
- FR3: 审批流
  - 能对每个文档发起审批（request-approval），在 Dashboard 完成审批；审批通过后删除审批记录（delete-approval）。
- FR4: 查询与可见性
  - 可通过工具查看 Steering 文档存在性与最新审批状态；在需要时导出或同步到 docs/ 目录（后续可选）。
- FR5: 与规格系统集成
  - 本规格（steering）的阶段推进需受审批结果门控：requirements → design → tasks。

## 7. 非功能性需求（NFR）
- NFR1: 可靠性：审批前不得继续下一阶段；工具调用失败需可重试。
- NFR2: 可维护性：模板清晰、结构固定；路径一致且可被脚手架/工具识别。
- NFR3: 兼容性：Node ≥ 18；与现有 Vite/Vitest 环境不冲突。

## 8. 依赖与约束（Dependencies/Constraints）
- 依赖：spec-workflow MCP 服务、Dashboard（本地或扩展）。
- 约束：不在 Steering 文档中存放密钥；文件路径固定在 .spec-workflow/steering/。

## 9. 验收标准（Acceptance Criteria）
- AC1: 能创建三份 Steering 文档，并各自成功发起审批、通过审批并清理记录。
- AC2: 审批未通过或 pending 时，无法推进到本规格的下一个阶段。
- AC3: 任何路径/文件名错误会给出可读的报错并可重试。
- AC4: 在 spec-list 与 spec-status 中能看到 steering 规格的阶段状态更新。

## 10. 风险与缓解（Risks/Mitigations）
- R1: 审批长时间 pending → 显示阻塞提示与 Dashboard 地址，支持重复轮询。
- R2: 路径误配或模板缺失 → 内置校验并给出修正建议。
- R3: 团队对模板理解不一致 → 在模板中加入示例与注释。

## 11. 里程碑（Milestones）
- M1: requirements.md 创建并审批通过（当前阶段）。
- M2: design.md 创建并审批通过（定义实现方案与接口）。
- M3: tasks.md 创建并审批通过（落地任务清单与验收项）。
