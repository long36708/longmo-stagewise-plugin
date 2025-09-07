# 元素选择器使用文档

本组件与核心引擎提供网页元素的可视化选择、高亮与样式信息展示能力，支持单/多选、状态持久化与组合式API接入。

- 组件：`src/components/ElementSelector.vue`
- 组合式：`src/composables/useElementSelection.ts`、`src/composables/useElementStyles.ts`
- 引擎：`src/core/ElementSelectorEngine.ts`
- 工具：`src/utils/dom-utils.ts`、`src/utils/style-utils.ts`、`src/utils/event-utils.ts`、`src/utils/error-handler.ts`、`src/utils/performance-monitor.ts`
- 类型：`src/types/element-selector.ts`

## 快速开始

在任意 Vue 3 项目页面中引入组件并挂载。

```vue
<script setup lang="ts">
import ElementSelector from '@/components/ElementSelector.vue'

function onSelectionChange(els: Element[]) {
  console.log('selected:', els)
}
function onActiveElementChange(el: Element | null) {
  console.log('active:', el)
}
function onError(err: Error) {
  console.error(err)
}
</script>

<template>
  <ElementSelector
    :auto-enable="false"
    :max-selection-count="10"
    highlight-color="#3b82f6"
    :persist-selection="true"
    @selectionChange="onSelectionChange"
    @activeElementChange="onActiveElementChange"
    @error="onError"
  />
</template>
```

或使用组合式 API 直接控制核心选择流程：

```ts
import { onMounted } from 'vue'
import { useElementSelection } from '@/composables/useElementSelection'

const {
  isEnabled,
  selectedElements,
  activeElement,
  selectionMode,
  toggleSelection,
  clearSelection,
  setSelectionMode,
  getElementInfo
} = useElementSelection({
  config: {
    maxSelectionCount: 10,
    highlightColor: '#3b82f6',
    persistSelection: true
  },
  autoEnable: false
})

onMounted(() => {
  // 根据需要手动启用
  toggleSelection()
})
```

## 组件 API（ElementSelector.vue）

- Props
  - `autoEnable?: boolean` 默认 false，是否挂载后自动启用选择模式
  - `maxSelectionCount?: number` 默认 10，多选最大保留数量
  - `highlightColor?: string` 高亮颜色，默认 `#3b82f6`
  - `persistSelection?: boolean` 是否持久化选择状态，默认 true
- Emits
  - `selectionChange(elements: Element[])`
  - `activeElementChange(element: Element | null)`
  - `error(error: Error)`

键盘交互（启用状态下）：
- Tab：在 `single` 与 `multiple` 模式间切换
- Escape：退出选择模式
- Delete/Backspace：清除所有选择

## 组合式 API

### useElementSelection(options)

- 参数
  - `options.config?: Partial<SelectorConfig>`
    - `highlightColor`、`highlightOpacity`、`borderWidth`、`zIndex`
    - `enableMultiSelect`（影响初始模式）`persistSelection`、`maxSelectionCount`
  - `options.autoEnable?: boolean` 是否自动启用选择

- 状态（只读计算暴露）
  - `isEnabled`、`selectedElements`、`activeElement`
  - `selectionMode`（'single' | 'multiple'）
  - `error`、`isLoading`
  - `hasSelection`、`selectionCount`
  - 持久化信息：`hasSavedState`、`lastSaved`、`isStatePersisted`、`lastSavedTime`

- 方法
  - `initializeSelector()` 初始化选择引擎（已在 onMounted 内自动调用）
  - `enableSelection()` / `disableSelection()` / `toggleSelection()`
  - `clearSelection()` 清除选择并清理持久化
  - `setSelectionMode(mode)` 切换选择模式
  - `getElementInfo(el)` 返回元素样式信息（见下文）
  - `getSelectedElementsInfo()` 批量获取当前选中元素信息
  - `clearError()`、`reset()`、`saveCurrentState()`、`loadSavedState()`

持久化同步说明：
- 组合式在初始化时会检查本地持久化并尝试加载，随后同步一次当前引擎状态到组合式，从而触发组件 watch → 发出 `selectionChange`。

### useElementStyles(elRef)

适合围绕某个元素进行样式提取和监听变化（实现见 `src/composables/useElementStyles.ts`），提供：
- 样式映射获取、解析/格式化 `CSS`、应用/移除样式
- `MutationObserver`/`ResizeObserver` 监听变动

## 核心引擎 API（ElementSelectorEngine）

构造：
```ts
import { ElementSelectorEngine } from '@/core/ElementSelectorEngine'
const engine = new ElementSelectorEngine(
  {
    enableMultiSelect: true,
    persistSelection: true,
    maxSelectionCount: 10,
    highlightColor: '#3b82f6'
  },
  {
    onSelectionChange: (els) => {},
    onActiveElementChange: (el) => {},
    onSelectionModeChange: (mode) => {},
    onError: (err) => {}
  }
)
```

主要方法：
- `enableSelection()` / `disableSelection()` / `toggleSelection()`
- `clearSelection()`、`setSelectionMode(mode)`
- `getSelectedElements(): Element[]`、`getActiveElement(): Element | null`
- `getElementInfo(element): ElementStyleInfo`
- 销毁：`destroy()`

说明：
- 引擎内部维护高亮遮罩层（`#element-selector-highlight`），通过 `getBoundingClientRect` 与滚动偏移计算定位。
- DOM 变更通过 `MutationObserver` 监听，自动清理已移除的选中元素并派发更新。

## 元素样式信息（ElementStyleInfo）

由 `getElementStyleInfo(element)` 返回（定义见 `src/utils/dom-utils.ts`）：
```ts
type ElementStyleInfo = {
  element: Element
  tagName: string
  className?: string
  id?: string
  // 归一化矩形
  rect: { x: number; y: number; width: number; height: number; top: number; right: number; bottom: number; left: number }
  // 直接提供 DOMRect 以便测试与高级用法
  boundingRect: DOMRect
  computedStyles: Record<string, string>
  inlineStyles: Record<string, string>
  visibility: { display: string; visibility: string; opacity: number; overflow: string }
  // 可用于最佳努力恢复选择
  selector: string
}
```

## 状态持久化

- 默认启用（可通过 `persistSelection` 关闭）
- 存储项：使用 `SELECTOR_CONSTANTS.STORAGE_KEY` 的本地存储
- 仅存可序列化字段（避免直接存 DOM），加载时通过 `selector` 尝试恢复
- 页面结构变化可能导致部分恢复失败，已做 best-effort 处理

## 错误处理

错误类型 `SelectorError`，常见错误码：
- `INITIALIZATION_ERROR` `ENABLE_ERROR` `DISABLE_ERROR`
- `MOUSEOVER_ERROR` `CLICK_ERROR` `MODE_ERROR` `CLEAR_ERROR`
- `INFO_ERROR` `SAVE_ERROR` `LOAD_ERROR` `STYLE_INFO_ERROR`

建议在组件层监听 `error` 事件统一提示或上报。

## 性能与最佳实践

- 高亮开销：已使用 `throttle` 限制鼠标悬停频率（16ms）
- 大页面建议：
  - 限制 `maxSelectionCount`，降低集合操作成本
  - 仅在需要时启用选择模式，完成后及时关闭
- 动态 DOM：
  - 引擎自动移除已失效的选中元素
  - 通过 `MutationObserver` 最小化刷新频率
- 跨域 iframe：
  - 无法访问跨域文档节点，错误会被捕获并通过 `onError` 派发

## 事件与键盘操作

- 鼠标：
  - `mouseover` 更新活动元素并显示高亮
  - `click` 切换选中状态（单/多选按当前模式生效）
- 键盘：
  - `Tab`：切换单选/多选模式
  - `Escape`：退出选择模式
  - `Delete/Backspace`：清空选择集

## 常见问题

- 看不到高亮层？
  - 检查页面是否有极高的 `z-index` 元素遮盖；可提高配置中的 `zIndex`
- 选择无法恢复？
  - DOM 结构变化可能导致选择器失效；请检查元素是否仍可通过保存的 `selector` 查询到
- 类型错误或找不到模块？
  - 确认存在 `src/shims-vue.d.ts` 与 `src/vite-env.d.ts` 声明
  - 运行 `pnpm run type-check` 查看详细错误

## 开发与测试

- 类型检查：`pnpm run type-check`
- 运行单测：`pnpm vitest run`
  - 覆盖项包括：引擎、DOM工具、组件与集成流程