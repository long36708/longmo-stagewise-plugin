# Steering 规格 · Design

## 1. 概述
依据 requirements.md，定义将 Steering 文档（product.md、tech.md、structure.md）纳入规格工作流（spec-workflow）的技术方案与流程编排，确保创建、审批、更新与可见性全链路可控。

## 2. 架构与边界
- 参与方：
  - MCP 工具：spec-workflow 服务器
  - Dashboard/VS Code 扩展：审批与进度可视化
  - 仓库文件：
    - 指导文档：.spec-workflow/steering/{product,tech,structure}.md
    - 规格文档：.spec-workflow/specs/steering/{requirements,design,tasks}.md
- 边界：无运行时接口暴露；仅开发流程与仓库文件结构变更。

## 3. 目录与文件
- 指导文档路径固定：.spec-workflow/steering/
- 规格文档路径固定：.spec-workflow/specs/steering/
- 审批仅针对具体文件（filePath 指向上述路径之一）。

## 4. 数据与状态模型
- 审批记录（Approval）：
  - 字段：approvalId、filePath、title、type(document)、status(pending/approved/needs-revision)、timestamps
  - 约束：批准后必须 delete-approval 成功，方可进入下一阶段
- 文档实体：
  - steering/product.md、tech.md、structure.md：项目指导信息
  - specs/steering/{requirements,design,tasks}.md：规格阶段产物

## 5. 工作流编排
- Requirements 阶段（已完成）：
  1) get-template-context(spec/requirements)
  2) create-spec-doc(document: requirements)
  3) request-approval(filePath 仅指向 .spec-workflow/specs/steering/requirements.md)
  4) get-approval-status 轮询 → approved → delete-approval
- Design 阶段（当前阶段）：
  1) get-template-context(spec/design)
  2) 依据 requirements 拆解技术方案（见本文件）
  3) create-spec-doc(document: design)
  4) request-approval(filePath 仅指向 .spec-workflow/specs/steering/design.md)
  5) 轮询 → approved → delete-approval
- Tasks 阶段（下一阶段）：
  1) get-template-context(spec/tasks)
  2) 将设计转化为可执行任务（1-3 文件粒度，含路径与验收）
  3) create-spec-doc(document: tasks)
  4) 审批 → 批准 → 清理审批

## 6. 技术细节
- 工具清单（均通过 MCP 调用）：
  - get-template-context、create-spec-doc、request-approval、get-approval-status、delete-approval、spec-status/spec-list
- 错误处理：
  - 审批 pending：阻塞后续阶段，提示 dashboardUrl 并轮询
  - needs-revision：据反馈更新文档，重新发起审批（新的 approvalId）
  - 删除失败：停止流程，返回轮询
- 安全与合规：
  - 不写入密钥；固定路径；审批仅走 Dashboard/扩展

## 7. 与指导文档的关系
- product/tech/structure 为背景与约束来源；
- steering 规格文件的内容与阶段推进受其约束但独立审批。

## 8. 测试方案（设计验证）
- 通过 spec-workflow 工具链实现往返测试：
  - 创建 design.md → 请求审批 → 轮询通过 → 删除审批
  - spec-status 应显示 “design: created/approved”，准备进入 tasks

## 9. 风险与对策
- 长时间未审批：持续轮询并显示阻塞信息
- 路径误配：在请求审批前校验 filePath 指向 .spec-workflow/specs/steering/
- 模板变更：以 get-template-context 实时加载，避免硬编码模板

## 10. 里程碑与验收
- 里程碑：design.md 创建、审批通过且完成 delete-approval
- 验收：
  - Dashboard 可见并通过审批
  - spec-status 进入下一阶段（tasks 可创建）
