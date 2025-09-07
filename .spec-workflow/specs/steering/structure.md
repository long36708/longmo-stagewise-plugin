# Project Structure

## Directory Organization

```
stagewise-plugin/
├── src/                           # 源代码目录
│   ├── components/                # Vue组件
│   │   ├── core/                  # 核心功能组件
│   │   │   ├── ElementSelector.vue    # 元素选择器组件
│   │   │   ├── StyleEditor.vue        # 样式编辑器组件
│   │   │   ├── PreviewPanel.vue       # 预览面板组件
│   │   │   └── ToolbarFloat.vue       # 浮动工具栏组件
│   │   ├── ui/                    # UI基础组件
│   │   │   ├── Button.vue             # 按钮组件
│   │   │   ├── Modal.vue              # 模态框组件
│   │   │   ├── Tooltip.vue            # 提示组件
│   │   │   └── ColorPicker.vue        # 颜色选择器组件
│   │   └── features/              # 功能特性组件
│   │       ├── Screenshot.vue         # 截图功能组件
│   │       ├── Comments.vue           # 评论系统组件
│   │       └── FrameworkDetector.vue  # 框架检测组件
│   ├── composables/               # Vue3 Composition API逻辑
│   │   ├── useElementSelection.ts     # 元素选择逻辑
│   │   ├── useStyleManagement.ts      # 样式管理逻辑
│   │   ├── useScreenshot.ts           # 截图功能逻辑
│   │   ├── useLocalStorage.ts         # 本地存储逻辑
│   │   └── useFrameworkDetection.ts   # 框架检测逻辑
│   ├── utils/                     # 工具函数
│   │   ├── dom.ts                     # DOM操作工具
│   │   ├── css.ts                     # CSS处理工具
│   │   ├── color.ts                   # 颜色处理工具
│   │   ├── storage.ts                 # 存储工具
│   │   └── validation.ts              # 验证工具
│   ├── types/                     # TypeScript类型定义
│   │   ├── element.ts                 # 元素相关类型
│   │   ├── style.ts                   # 样式相关类型
│   │   ├── config.ts                  # 配置相关类型
│   │   └── api.ts                     # API接口类型
│   ├── constants/                 # 常量定义
│   │   ├── config.ts                  # 配置常量
│   │   ├── colors.ts                  # 颜色常量
│   │   └── messages.ts                # 消息常量
│   ├── styles/                    # 样式文件
│   │   ├── main.scss                  # 主样式文件
│   │   ├── variables.scss             # SCSS变量
│   │   ├── mixins.scss                # SCSS混入
│   │   └── components/                # 组件样式
│   │       ├── toolbar.scss           # 工具栏样式
│   │       ├── modal.scss             # 模态框样式
│   │       └── editor.scss            # 编辑器样式
│   ├── assets/                    # 静态资源
│   │   ├── icons/                     # 图标文件
│   │   ├── images/                    # 图片文件
│   │   └── fonts/                     # 字体文件
│   ├── main.ts                    # 入口文件
│   └── App.vue                    # 根组件
├── tests/                         # 测试文件
│   ├── unit/                      # 单元测试
│   │   ├── components/            # 组件测试
│   │   ├── composables/           # Composables测试
│   │   └── utils/                 # 工具函数测试
│   └── integration/               # 集成测试
├── docs/                          # 文档
│   ├── api/                       # API文档
│   ├── guides/                    # 使用指南
│   └── examples/                  # 示例代码
├── examples/                      # 使用示例
│   ├── basic/                     # 基础示例
│   ├── advanced/                  # 高级示例
│   └── integration/               # 集成示例
├── dist/                          # 构建输出
├── public/                        # 公共静态文件
├── .spec-workflow/                # 规范工作流文件
├── package.json                   # 项目配置
├── vite.config.ts                 # Vite配置
├── tsconfig.json                  # TypeScript配置
├── vitest.config.ts               # 测试配置
└── README.md                      # 项目说明
```

## Naming Conventions

### Files
- **Vue组件**: `PascalCase.vue` (如 `ElementSelector.vue`)
- **TypeScript文件**: `camelCase.ts` (如 `useElementSelection.ts`)
- **样式文件**: `kebab-case.scss` (如 `toolbar.scss`)
- **测试文件**: `[filename].test.ts` 或 `[filename].spec.ts`
- **类型定义文件**: `camelCase.ts` (如 `element.ts`)

### Code
- **Vue组件名**: `PascalCase` (如 `ElementSelector`)
- **Composables**: `use + PascalCase` (如 `useElementSelection`)
- **函数/方法**: `camelCase` (如 `getElementById`)
- **常量**: `UPPER_SNAKE_CASE` (如 `DEFAULT_CONFIG`)
- **变量**: `camelCase` (如 `selectedElement`)
- **接口/类型**: `PascalCase` (如 `ElementInfo`)

## Import Patterns

### Import Order
1. Vue相关导入
2. 第三方库导入
3. 内部模块导入（按层级排序）
4. 相对路径导入
5. 样式导入

### 示例导入结构
```typescript
// 1. Vue相关
import { ref, computed, onMounted } from 'vue'
import type { Ref } from 'vue'

// 2. 第三方库
import html2canvas from 'html2canvas'

// 3. 内部模块（绝对路径）
import { useElementSelection } from '@/composables/useElementSelection'
import type { ElementInfo } from '@/types/element'
import { DEFAULT_CONFIG } from '@/constants/config'

// 4. 相对路径
import Button from '../ui/Button.vue'
import { validateElement } from './validation'

// 5. 样式
import './ElementSelector.scss'
```

### 路径别名配置
```typescript
// vite.config.ts中配置
resolve: {
  alias: {
    '@': path.resolve(__dirname, 'src'),
    '@components': path.resolve(__dirname, 'src/components'),
    '@composables': path.resolve(__dirname, 'src/composables'),
    '@utils': path.resolve(__dirname, 'src/utils'),
    '@types': path.resolve(__dirname, 'src/types')
  }
}
```

## Code Structure Patterns

### Vue组件组织
```vue
<template>
  <!-- 模板内容 -->
</template>

<script setup lang="ts">
// 1. 导入声明
// 2. Props和Emits定义
// 3. 响应式数据
// 4. Composables使用
// 5. 计算属性
// 6. 方法定义
// 7. 生命周期钩子
// 8. 监听器
</script>

<style scoped lang="scss">
/* 组件样式 */
</style>
```

### Composables组织
```typescript
// 1. 导入
import { ref, computed } from 'vue'

// 2. 类型定义
interface UseFeatureOptions {
  // 选项类型
}

// 3. 主函数
export function useFeature(options?: UseFeatureOptions) {
  // 4. 响应式状态
  const state = ref()
  
  // 5. 计算属性
  const computed = computed(() => {})
  
  // 6. 方法
  const methods = {
    // 方法实现
  }
  
  // 7. 生命周期（如需要）
  
  // 8. 返回API
  return {
    state,
    computed,
    ...methods
  }
}
```

### 工具函数组织
```typescript
// 1. 导入
// 2. 类型定义
// 3. 常量
// 4. 主要函数
// 5. 辅助函数
// 6. 导出
```

## Code Organization Principles

1. **单一职责**: 每个文件和组件都有明确的单一职责
2. **组合优于继承**: 使用Composition API进行逻辑复用
3. **类型安全**: 充分利用TypeScript的类型系统
4. **可测试性**: 代码结构便于单元测试和集成测试
5. **可维护性**: 清晰的目录结构和命名约定

## Module Boundaries

### 核心边界定义
- **组件层 (Components)**: 只负责UI展示和用户交互
- **逻辑层 (Composables)**: 处理业务逻辑和状态管理
- **工具层 (Utils)**: 提供纯函数工具，无副作用
- **类型层 (Types)**: 定义数据结构和接口契约
- **常量层 (Constants)**: 存储配置和不变数据

### 依赖方向规则
```
组件 → Composables → Utils
  ↓        ↓         ↓
Types ← Constants ← Types
```

### 模块隔离原则
- **UI组件**不直接操作DOM，通过Composables
- **Composables**不直接导入Vue组件
- **Utils**保持纯函数，不依赖Vue生态
- **Types**可被任何层级导入
- **Constants**只被其他模块导入，不导入其他模块

## Code Size Guidelines

### 文件大小限制
- **Vue组件**: 最大300行（包含模板、脚本、样式）
- **Composables**: 最大200行
- **工具函数文件**: 最大150行
- **类型定义文件**: 最大100行

### 函数复杂度限制
- **单个函数**: 最大50行
- **组件方法**: 最大30行
- **工具函数**: 最大20行
- **嵌套深度**: 最大4层

### 组件复杂度控制
- **Props数量**: 最大10个
- **Emits事件**: 最大8个
- **计算属性**: 最大15个
- **方法数量**: 最大12个

## Plugin Architecture Structure

### 插件系统组织
```
src/
├── core/                      # 核心系统
│   ├── PluginManager.ts       # 插件管理器
│   ├── EventBus.ts            # 事件总线
│   └── Registry.ts            # 注册中心
├── plugins/                   # 插件目录
│   ├── screenshot/            # 截图插件
│   ├── comments/              # 评论插件
│   └── framework-detector/    # 框架检测插件
└── interfaces/                # 插件接口
    ├── IPlugin.ts             # 插件基础接口
    └── IPluginContext.ts      # 插件上下文接口
```

### 插件隔离原则
- 插件之间不直接依赖
- 通过事件总线进行通信
- 核心系统提供统一的API接口
- 插件可独立开发和测试

## Documentation Standards

### 代码文档要求
- **所有公共API**必须有TSDoc注释
- **复杂业务逻辑**需要行内注释说明
- **组件Props**必须有类型和描述
- **Composables**需要使用示例

### 文档格式标准
```typescript
/**
 * 元素选择器Composable
 * @description 提供元素选择和高亮功能
 * @param options 配置选项
 * @returns 选择器API对象
 * @example
 * ```ts
 * const { selectElement, selectedElement } = useElementSelection()
 * selectElement(document.querySelector('.target'))
 * ```
 */
export function useElementSelection(options?: SelectionOptions) {
  // 实现
}
```

### README文件要求
- **每个主要模块**都需要README.md
- **API文档**自动生成并保持更新
- **使用示例**覆盖常见场景
- **贡献指南**说明开发规范