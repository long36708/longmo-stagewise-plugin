<template>
  <div class="element-selector-panel" v-if="isEnabled">
    <div class="panel-header">
      <h3>Element Selector</h3>
      <button @click="disableSelection" class="close-btn">&times;</button>
    </div>
    <div class="panel-controls">
      <button @click="toggleSelection" :class="{ active: isEnabled }">
        {{ isEnabled ? 'Disable' : 'Enable' }} Selection
      </button>
      <button @click="clearSelection" :disabled="!hasSelection">Clear</button>
      <div class="selection-mode">
        <label>Mode:</label>
        <select :value="selectionMode" @change="onModeChange">
          <option value="single">Single</option>
          <option value="multiple">Multiple</option>
        </select>
      </div>
    </div>
    <div class="panel-status">
      <p>Status: {{ isEnabled ? 'Active' : 'Inactive' }}</p>
      <p>Selected: {{ selectionCount }}</p>
    </div>
    <div v-if="error" class="panel-error">
      <p><strong>Error:</strong> {{ error.message }}</p>
      <button @click="clearError">Dismiss</button>
    </div>
    <div class="selected-elements-list" v-if="hasSelection">
      <h4>Selected Elements:</h4>
      <ul>
        <li v-for="(info, index) in selectedElementsInfo" :key="index">
          <pre>{{ info.selector }}</pre>
        </li>
      </ul>
    </div>
  </div>
  <div v-else class="floating-button">
     <button @click="enableSelection">
        Select Elements
      </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useElementSelection } from '../composables/useElementSelection';
import type { SelectionMode, ElementStyleInfo } from '../types/element-selector';

// Props and Emits
interface Props {
  autoEnable?: boolean;
  initialMode?: SelectionMode;
}

const props = withDefaults(defineProps<Props>(), {
  autoEnable: false,
  initialMode: 'multiple',
});

const emit = defineEmits<{
  (e: 'selection-change', elements: Element[]): void;
  (e: 'error', error: Error): void;
}>();


// Integration with the composable
const {
  isEnabled,
  selectedElements,
  selectionMode,
  error,
  hasSelection,
  selectionCount,
  enableSelection,
  disableSelection,
  toggleSelection,
  clearSelection,
  setSelectionMode,
  getSelectedElementsInfo,
  clearError,
} = useElementSelection({
  autoEnable: props.autoEnable,
  config: {
    initialMode: props.initialMode,
  },
});

const selectedElementsInfo = computed<ElementStyleInfo[]>(() => {
  return getSelectedElementsInfo();
});

const onModeChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  setSelectionMode(target.value as SelectionMode);
};

</script>

<style lang="scss" scoped>
.element-selector-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 350px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #dee2e6;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #6c757d;
    padding: 0;
    line-height: 1;
  }
}

.panel-controls {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  align-items: center;
  flex-wrap: wrap;

  button {
    padding: 6px 12px;
    border: 1px solid #007bff;
    background-color: #fff;
    color: #007bff;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;

    &.active {
      background-color: #007bff;
      color: #fff;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      border-color: #6c757d;
      color: #6c757d;
      background-color: #f8f9fa;
    }
  }
}

.selection-mode {
  display: flex;
  align-items: center;
  gap: 6px;
  
  label {
    font-size: 14px;
  }

  select {
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid #ced4da;
  }
}

.panel-status {
  padding: 8px 16px;
  background-color: #e9ecef;
  font-size: 13px;
  color: #495057;
  border-top: 1px solid #dee2e6;
  border-bottom: 1px solid #dee2e6;

  p {
    margin: 4px 0;
  }
}

.panel-error {
  padding: 12px 16px;
  background-color: #f8d7da;
  color: #721c24;
  border-bottom: 1px solid #f5c6cb;
  
  p {
    margin: 0 0 8px 0;
  }

  button {
    padding: 4px 8px;
    font-size: 12px;
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
}

.selected-elements-list {
  padding: 12px 16px;
  max-height: 200px;
  overflow-y: auto;

  h4 {
    margin: 0 0 8px 0;
    font-size: 14px;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    background: #e9ecef;
    padding: 8px;
    border-radius: 4px;
    margin-bottom: 6px;
    font-size: 12px;
    
    pre {
      margin: 0;
      white-space: pre-wrap;
      word-break: break-all;
    }
  }
}

.floating-button {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 9998;

  button {
    padding: 12px 20px;
    font-size: 16px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 50px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    transition: background-color 0.3s, transform 0.2s;

    &:hover {
      background-color: #0056b3;
      transform: translateY(-2px);
    }
  }
}
</style>