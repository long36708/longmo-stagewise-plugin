<template>
  <div class="element-selector">
    <!-- 控制面板 -->
    <SelectionControls
      :is-enabled="isEnabled"
      :has-selection="hasSelection"
      :selection-mode="selectionMode"
      @toggle-selection="toggleSelection"
      @clear-selection="clearSelection"
      @set-selection-mode="setSelectionMode"
    />

    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      <div class="error-content">
        <span class="error-icon">⚠️</span>
        <span class="error-text">{{ error.message }}</span>
        <button @click="clearError" class="error-close">×</button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-indicator">
      <div class="spinner"></div>
      <span>初始化中...</span>
    </div>

    <!-- 活动元素信息 -->
    <div v-if="activeElement && isEnabled" class="active-element-info">
      <h4>当前元素</h4>
      <ElementInfo :element="activeElement" />
    </div>

    <!-- 选中元素列表 -->
    <div v-if="hasSelection" class="selected-elements">
      <h4>已选择元素 ({{ selectionCount }})</h4>
      <div class="elements-list">
        <div
          v-for="(element, index) in selectedElements"
          :key="index"
          class="element-item"
        >
          <div class="element-header">
            <span class="element-tag">{{ getElementTag(element) }}</span>
            <button
              @click="removeElement(element)"
              class="remove-btn"
              title="移除此元素"
            >
              ×
            </button>
          </div>
          <ElementInfo :element="element" :compact="true" />
        </div>
      </div>
    </div>

    <!-- 使用说明 -->
    <div v-if="!isEnabled && !hasSelection" class="usage-guide">
      <h4>使用说明</h4>
      <ul>
        <li>点击"开始选择"启用元素选择模式</li>
        <li>鼠标悬停在页面元素上查看高亮效果</li>
        <li>点击元素进行选择</li>
        <li>使用Tab键切换单选/多选模式</li>
        <li>按Esc键退出选择模式</li>
        <li>按Delete键清除所有选择</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { useElementSelection } from '@/composables/useElementSelection';
import ElementInfo from './ElementInfo.vue';
import SelectionControls from './SelectionControls.vue';
import type { SelectionMode } from '@/types/element-selector';

// Props
interface Props {
  autoEnable?: boolean;
  maxSelectionCount?: number;
  highlightColor?: string;
  persistSelection?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  autoEnable: false,
  maxSelectionCount: 10,
  highlightColor: '#3b82f6',
  persistSelection: true
});

// Emits
interface Emits {
  (e: 'selectionChange', elements: Element[]): void;
  (e: 'activeElementChange', element: Element | null): void;
  (e: 'error', error: Error): void;
}

const emit = defineEmits<Emits>();

// 使用组合式函数
const {
  isEnabled,
  selectedElements,
  activeElement,
  selectionMode,
  error,
  isLoading,
  hasSelection,
  selectionCount,
  toggleSelection,
  clearSelection,
  setSelectionMode,
  clearError
} = useElementSelection({
  config: {
    maxSelectionCount: props.maxSelectionCount,
    highlightColor: props.highlightColor,
    persistSelection: props.persistSelection
  },
  autoEnable: props.autoEnable
});

// 监听状态变化并发出事件
watch(selectedElements, (elements) => {
  emit('selectionChange', elements);
});

watch(activeElement, (element) => {
  emit('activeElementChange', element);
});

watch(error, (err) => {
  if (err) {
    emit('error', err);
  }
});

// 方法
const getElementTag = (element: Element): string => {
  const tag = element.tagName.toLowerCase();
  const id = element.id ? `#${element.id}` : '';
  const className = element.className ? `.${element.className.split(' ').join('.')}` : '';
  return `${tag}${id}${className}`;
};

const removeElement = (element: Element) => {
  // 这里需要实现从选择中移除特定元素的功能
  // 由于当前API没有直接支持，我们可以通过清除后重新选择其他元素来实现
  selectedElements.value.filter((el: Element) => el !== element);
  clearSelection();
  // 注意：这里需要在SelectorEngine中添加selectElements方法来批量选择
};
</script>

<style scoped lang="scss">
.element-selector {
  padding: 16px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 400px;
  max-height: 600px;
  overflow-y: auto;
}

.selector-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.control-group {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.btn {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #ffffff;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #9ca3af;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.btn-primary {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;

    &:hover:not(:disabled) {
      background: #2563eb;
    }

    &.active {
      background: #dc2626;
      border-color: #dc2626;

      &:hover:not(:disabled) {
        background: #b91c1c;
      }
    }
  }

  &.btn-secondary {
    background: #6b7280;
    color: white;
    border-color: #6b7280;

    &:hover:not(:disabled) {
      background: #4b5563;
    }
  }
}

.mode-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #374151;

  select {
    padding: 4px 8px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    background: white;
    font-size: 14px;
  }
}

.error-message {
  margin-bottom: 16px;
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
}

.error-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.error-icon {
  font-size: 16px;
}

.error-text {
  flex: 1;
  font-size: 14px;
}

.error-close {
  background: none;
  border: none;
  color: #dc2626;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  color: #6b7280;
  font-size: 14px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.active-element-info,
.selected-elements {
  margin-bottom: 16px;

  h4 {
    margin: 0 0 8px 0;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
  }
}

.elements-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.element-item {
  padding: 8px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
}

.element-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.element-tag {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  color: #7c3aed;
  font-weight: 500;
}

.remove-btn {
  background: none;
  border: none;
  color: #dc2626;
  font-size: 16px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;

  &:hover {
    background: #fef2f2;
  }
}

.usage-guide {
  color: #6b7280;
  font-size: 14px;

  h4 {
    margin: 0 0 8px 0;
    color: #374151;
  }

  ul {
    margin: 0;
    padding-left: 20px;
  }

  li {
    margin-bottom: 4px;
  }
}
</style>