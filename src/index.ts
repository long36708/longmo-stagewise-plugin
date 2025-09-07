// 库入口：导出组件、组合式 API 与类型

// 组件
export { default as ElementSelector } from './components/ElementSelector.vue';
export { default as ElementInfoPanel } from './components/ElementInfoPanel.vue';

// 组合式
export * from './composables/useElementSelection';
export * from './composables/useElementStyles';

// 核心引擎
export * from './core/ElementSelectorEngine';

// 类型
export * from './types/element-selector';