/**
 * Vue 3 元素选择器组合式函数
 */

import { ref, onMounted, onUnmounted, computed } from 'vue';
import { ElementSelectorEngine } from '@/core/ElementSelectorEngine';
import { SelectionPersistenceManager } from '@/core/selection-persistence';
import {
  SelectorConfig,
  SelectorEvents,
  SelectionMode,
  ElementStyleInfo,
  SelectorError
} from '@/types/element-selector';

export interface UseElementSelectionOptions {
  config?: Partial<SelectorConfig>;
  autoEnable?: boolean;
}

export function useElementSelection(options: UseElementSelectionOptions = {}) {
  // 响应式状态
  const isEnabled = ref(false);
  const selectedElements = ref<Element[]>([]);
  const activeElement = ref<Element | null>(null);
  const selectionMode = ref<SelectionMode>('multiple');
  const error = ref<SelectorError | null>(null);
  const isLoading = ref(false);
  const lastSaved = ref<string | null>(null);
  const hasSavedState = ref(false);

  // 选择器引擎实例
  let selectorEngine: ElementSelectorEngine | null = null;

  // 计算属性
  const hasSelection = computed(() => selectedElements.value.length > 0);
  const selectionCount = computed(() => selectedElements.value.length);
  const canSelectMore = computed(() => {
    const maxCount = options.config?.maxSelectionCount || 10;
    return selectedElements.value.length < maxCount;
  });
  const isStatePersisted = computed(() => hasSavedState.value);
  const lastSavedTime = computed(() => (lastSaved.value ? new Date(lastSaved.value) : null));

  // 事件处理器
  const events: SelectorEvents = {
    onSelectionChange: (elements: Element[]) => {
      selectedElements.value = elements;
    },
    onActiveElementChange: (element: Element | null) => {
      activeElement.value = element;
    },
    onSelectionModeChange: (mode: SelectionMode) => {
      selectionMode.value = mode;
    },
    onError: (err: SelectorError) => {
      error.value = err;
      console.error('Element selection error:', err);
    }
  };

  // 检查持久化状态
  const checkPersistedState = () => {
    hasSavedState.value = SelectionPersistenceManager.hasSavedState();
    lastSaved.value = SelectionPersistenceManager.getStateTimestamp();
  };

  // 初始化选择器
  const initializeSelector = () => {
    try {
      isLoading.value = true;
      error.value = null;

      // 先检查持久化状态
      checkPersistedState();

      selectorEngine = new ElementSelectorEngine(options.config, events);
      // 若存在持久化状态，确保加载并在微任务中同步到组合式状态，触发组件 watch -> emit
      if (hasSavedState.value) {
        (selectorEngine as any).loadPersistedSelection?.();
      }
      Promise.resolve().then(() => {
        try {
          const els = selectorEngine?.getSelectedElements?.() ?? [];
          selectedElements.value = els;
          activeElement.value = selectorEngine?.getActiveElement?.() ?? null;
        } catch {
          // ignore
        }
      });

      if (options.autoEnable) {
        enableSelection();
      }
    } catch (err) {
      error.value = new SelectorError(
        `Failed to initialize selector: ${err}`,
        'INITIALIZATION_ERROR'
      );
    } finally {
      isLoading.value = false;
    }
  };

  // 启用选择
  const enableSelection = () => {
    if (!selectorEngine) {
      initializeSelector();
    }

    try {
      selectorEngine?.enableSelection();
      isEnabled.value = true;
      error.value = null;
    } catch (err) {
      error.value = new SelectorError(
        `Failed to enable selection: ${err}`,
        'ENABLE_ERROR'
      );
    }
  };

  // 禁用选择
  const disableSelection = () => {
    try {
      selectorEngine?.disableSelection();
      isEnabled.value = false;
      activeElement.value = null;
      error.value = null;
    } catch (err) {
      error.value = new SelectorError(
        `Failed to disable selection: ${err}`,
        'DISABLE_ERROR'
      );
    }
  };

  // 切换选择状态
  const toggleSelection = () => {
    if (isEnabled.value) {
      disableSelection();
    } else {
      enableSelection();
    }
  };

  // 清除选择
  const clearSelection = () => {
    try {
      selectorEngine?.clearSelection();
      // 清除持久化状态
      SelectionPersistenceManager.clearState();
      checkPersistedState();
      error.value = null;
    } catch (err) {
      error.value = new SelectorError(
        `Failed to clear selection: ${err}`,
        'CLEAR_ERROR'
      );
    }
  };

  // 设置选择模式
  const setSelectionMode = (mode: SelectionMode) => {
    try {
      selectorEngine?.setSelectionMode(mode);
      error.value = null;
    } catch (err) {
      error.value = new SelectorError(
        `Failed to set selection mode: ${err}`,
        'MODE_ERROR'
      );
    }
  };

  // 获取元素信息
  const getElementInfo = (element: Element): ElementStyleInfo | null => {
    try {
      if (!selectorEngine) return null;
      return selectorEngine.getElementInfo(element);
    } catch (err) {
      error.value = new SelectorError(
        `Failed to get element info: ${err}`,
        'INFO_ERROR',
        element
      );
      return null;
    }
  };

  // 获取选中元素的详细信息
  const getSelectedElementsInfo = (): ElementStyleInfo[] => {
    return selectedElements.value
      .map((element) => getElementInfo(element))
      .filter((info): info is ElementStyleInfo => info !== null);
  };

  // 清除错误
  const clearError = () => {
    error.value = null;
  };

  // 重置所有状态
  const reset = () => {
    disableSelection();
    clearSelection();
    clearError();
  };

  // 手动保存当前状态
  const saveCurrentState = () => {
    try {
      if (selectorEngine) {
        // 调用引擎的持久化方法
        (selectorEngine as any).persistSelection?.();
        checkPersistedState();
        return true;
      }
      return false;
    } catch (err) {
      error.value = new SelectorError(
        `Failed to save state: ${err}`,
        'SAVE_ERROR'
      );
      return false;
    }
  };

  // 手动加载保存的状态
  const loadSavedState = () => {
    try {
      if (selectorEngine) {
        // 调用引擎的加载方法
        (selectorEngine as any).loadPersistedSelection?.();
        checkPersistedState();
        return true;
      }
      return false;
    } catch (err) {
      error.value = new SelectorError(
        `Failed to load saved state: ${err}`,
        'LOAD_ERROR'
      );
      return false;
    }
  };

  // 生命周期钩子
  onMounted(() => {
    // 始终初始化引擎；autoEnable 仅控制是否立即启用选择
    initializeSelector();
  });

  onUnmounted(() => {
    try {
      selectorEngine?.destroy();
      selectorEngine = null;
    } catch (err) {
      console.error('Failed to cleanup selector engine:', err);
    }
  });

  // 返回API
  return {
    // 状态（以只读计算暴露，防止外部直接写）
    isEnabled: readonly(isEnabled),
    selectedElements: readonly(selectedElements),
    activeElement: readonly(activeElement),
    selectionMode: readonly(selectionMode),
    error: readonly(error),
    isLoading: readonly(isLoading),

    // 计算属性
    hasSelection,
    selectionCount,
    canSelectMore,

    // 方法
    enableSelection,
    disableSelection,
    toggleSelection,
    clearSelection,
    setSelectionMode,
    getElementInfo,
    getSelectedElementsInfo,
    clearError,
    reset,
    saveCurrentState,
    loadSavedState,

    // 工具方法
    initializeSelector,

    // 持久化状态
    lastSaved,
    hasSavedState,
    isStatePersisted,
    lastSavedTime
  };
}

// 只读包装器
function readonly(refObj: any) {
  return computed(() => refObj.value);
}