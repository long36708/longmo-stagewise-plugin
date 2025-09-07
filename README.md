# 网页微调插件 - 元素选择器
> 工作流指引：请阅读 docs/steering-and-specs.md（Steering 与 Specs 工作流），了解规格创建、审批与实施流程。

一个强大的Vue 3网页元素选择器插件，支持可视化选择、多选模式和详细的样式信息展示。

## 功能特性

### 🎯 核心功能
- **可视化元素选择**: 鼠标悬停高亮显示页面元素
- **多种选择模式**: 支持单选和多选模式
- **实时样式信息**: 显示元素的计算样式和内联样式
- **选择状态持久化**: 自动保存选择状态到本地存储
- **响应式设计**: 适配不同屏幕尺寸

### 🛠 技术特性
- **Vue 3 + TypeScript**: 现代化的前端技术栈
- **组合式API**: 使用Vue 3 Composition API
- **类型安全**: 完整的TypeScript类型定义
- **模块化架构**: 清晰的代码组织结构
- **错误处理**: 完善的错误处理机制

## 快速开始

### 环境要求
- Node.js >= 16
- pnpm >= 8

### 安装依赖
```bash
pnpm install
```

### 开发模式
```bash
pnpm dev
```

### 构建生产版本
```bash
pnpm build
```

### 运行测试
```bash
pnpm test
```

## 使用方法

### 基本用法

```vue
<template>
  <ElementSelector
    :auto-enable="false"
    :max-selection-count="10"
    :highlight-color="'#3b82f6'"
    :persist-selection="true"
    @selection-change="handleSelectionChange"
    @active-element-change="handleActiveElementChange"
    @error="handleError"
  />
</template>

<script setup lang="ts">
import ElementSelector from '@/components/ElementSelector.vue'

const handleSelectionChange = (elements: Element[]) => {
  console.log('Selected elements:', elements)
}

const handleActiveElementChange = (element: Element | null) => {
  console.log('Active element:', element)
}

const handleError = (error: Error) => {
  console.error('Selector error:', error)
}
</script>
```

### 使用组合式函数

```vue
<script setup lang="ts">
import { useElementSelection } from '@/composables/useElementSelection'

const {
  isEnabled,
  selectedElements,
  activeElement,
  selectionMode,
  enableSelection,
  disableSelection,
  clearSelection,
  setSelectionMode
} = useElementSelection({
  config: {
    highlightColor: '#3b82f6',
    maxSelectionCount: 10,
    persistSelection: true
  },
  autoEnable: true
})
</script>
```

## API 文档

### ElementSelector 组件

#### Props
| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `autoEnable` | `boolean` | `false` | 是否自动启用选择模式 |
| `maxSelectionCount` | `number` | `10` | 最大选择元素数量 |
| `highlightColor` | `string` | `'#3b82f6'` | 高亮颜色 |
| `persistSelection` | `boolean` | `true` | 是否持久化选择状态 |

#### Events
| 事件 | 参数 | 描述 |
|------|------|------|
| `selection-change` | `elements: Element[]` | 选择元素变化时触发 |
| `active-element-change` | `element: Element \| null` | 活动元素变化时触发 |
| `error` | `error: Error` | 发生错误时触发 |

### useElementSelection 组合式函数

#### 参数
```typescript
interface UseElementSelectionOptions {
  config?: Partial<SelectorConfig>
  autoEnable?: boolean
}
```

#### 返回值
```typescript
{
  // 状态
  isEnabled: Ref<boolean>
  selectedElements: Ref<Element[]>
  activeElement: Ref<Element | null>
  selectionMode: Ref<SelectionMode>
  error: Ref<SelectorError | null>
  isLoading: Ref<boolean>
  
  // 计算属性
  hasSelection: ComputedRef<boolean>
  selectionCount: ComputedRef<number>
  canSelectMore: ComputedRef<boolean>
  
  // 方法
  enableSelection: () => void
  disableSelection: () => void
  toggleSelection: () => void
  clearSelection: () => void
  setSelectionMode: (mode: SelectionMode) => void
  getElementInfo: (element: Element) => ElementStyleInfo | null
  getSelectedElementsInfo: () => ElementStyleInfo[]
  clearError: () => void
  reset: () => void
}
```

## 键盘快捷键

- `Esc`: 退出选择模式
- `Tab`: 切换单选/多选模式
- `Delete` / `Backspace`: 清除所有选择

## 项目结构

```
src/
├── components/          # Vue 组件
│   ├── ElementSelector.vue
│   └── ElementInfo.vue
├── composables/         # 组合式函数
│   └── useElementSelection.ts
├── core/               # 核心逻辑
│   └── selector-engine.ts
├── types/              # 类型定义
│   └── element-selector.ts
├── utils/              # 工具函数
│   └── dom-utils.ts
├── App.vue             # 主应用组件
└── main.ts             # 应用入口
```

## 开发指南

### 代码规范
- 使用 TypeScript 进行类型检查
- 遵循 Vue 3 组合式API 最佳实践
- 使用 ESLint 进行代码检查
- 采用模块化架构设计

### 测试
项目使用 Vitest 进行单元测试：

```bash
# 运行测试
pnpm test

# 运行测试并生成覆盖率报告
pnpm test:coverage

# 运行测试UI界面
pnpm test:ui
```

### 构建
```bash
# 开发构建
pnpm build:dev

# 生产构建
pnpm build

# 预览构建结果
pnpm preview
```

## 浏览器兼容性

- Chrome >= 88
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## 许可证

MIT License

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 更新日志

### v1.0.0 (2024-01-XX)
- 🎉 初始版本发布
- ✨ 实现基础元素选择功能
- ✨ 支持单选和多选模式
- ✨ 添加样式信息展示
- ✨ 实现选择状态持久化
- 📱 响应式设计支持