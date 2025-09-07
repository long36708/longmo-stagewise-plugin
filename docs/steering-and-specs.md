# Steering 与 Specs 工作流（团队指引）

本指南帮助团队在本仓库内规范化使用“规格工作流”（Spec Workflow）与 Steering 文档（product/tech/structure）。

## 1. 目标与范围
- 统一需求（Requirements）→ 设计（Design）→ 任务（Tasks）→ 实施（Implementation）的推进方式
- 强制审批闭环：每个阶段文档创建后，必须发起审批、轮询通过并清理审批记录
- Steering 文档作为项目指导文档，提供产品愿景、技术决策、代码结构规范

## 2. 工作流总览
- Requirements
  - 明确做什么与验收标准，创建 requirements.md
  - 发起审批（仅 filePath），轮询通过（approved）后 delete-approval
- Design
  - 基于 requirements 输出设计，创建 design.md → 审批 → 清理
- Tasks
  - 将设计拆分为可执行任务清单，创建 tasks.md → 审批 → 清理
- Implementation
  - 使用任务清单逐项实施：in-progress → completed（每项代码变更最小化）

## 3. 核心规则
- 仅通过工具/仪表盘进行审批；口头/聊天“已批准”一律无效
- 阶段按序推进，未通过审批不得进入下一阶段
- 审批通过后必须删除审批记录（delete-approval），否则流程被阻塞
- 只在任务阶段编写代码；在前置阶段修改文档并走审批
- 任务原子化：每项 1–3 个文件，含文件路径与验收点

## 4. 常用操作一览（在本仓库）
- 创建规格文档：create-spec-doc（requirements/design/tasks）
- 发起与跟踪审批：
  - request-approval（仅传 filePath）
  - get-approval-status（轮询，需为 approved）
  - delete-approval（审批通过后清理）
- 查看规格总览与进度：
  - spec-list（列出所有规格）
  - spec-status <name>（查看指定规格阶段状态）
- 刷新任务（当 requirements/design 变化时）：
  - refresh-tasks（用最新需求与设计重建 tasks.md）

仪表盘地址：启动后将在系统输出中提供（如 http://localhost:50048）。请仅在仪表盘/VS Code 扩展完成审批。

## 5. 典型流程示例
- 新建规格（示例：steering）
  1) requirements → 审批 → 清理
  2) design → 审批 → 清理
  3) tasks → 审批 → 清理
  4) Implementation：manage-tasks 标记任务进行/完成
- 刷新任务
  1) 当需求或设计更新，先 refresh-tasks
  2) 若任务清单调整，创建新的 tasks.md 并发起审批
  3) 审批通过并清理后再实施

## 6. Steering 指导文档
- 位置：.spec-workflow/steering/
  - product.md：产品愿景与目标
  - tech.md：关键技术决策与规范
  - structure.md：目录组织与命名/导出约定
- 作用：作为规格文档的背景与约束；与规格文档独立审批

## 7. 常见问题
- 问：审批已在聊天里说“通过”，为何仍阻塞？
  - 答：必须在仪表盘/扩展完成审批，并在系统中显示 approved，随后 delete-approval。
- 问：审批通过但仍无法进入下一阶段？
  - 答：检查是否已执行 delete-approval 并成功。
- 问：tasks.md 与 design/requirements 不一致？
  - 答：运行 refresh-tasks，并按模板更新 tasks.md 后重新审批。

## 8. 开发者速查
- 查看规格：spec-list、spec-status <name>
- 创建文档：create-spec-doc（按模板生成）
- 审批：request-approval → get-approval-status（approved）→ delete-approval
- 实施：manage-tasks（in-progress → completed）