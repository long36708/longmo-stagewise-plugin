
<template>
  <div class="selection-controls">
    <div class="control-group">
      <button @click="$emit('toggle-selection')" :class="{ active: isEnabled }">
        {{ isEnabled ? 'Disable' : 'Enable' }}
      </button>
      <button @click="$emit('clear-selection')" :disabled="!hasSelection">
        Clear
      </button>
    </div>
    <div class="control-group">
      <label for="selection-mode-select">Mode:</label>
      <select
        id="selection-mode-select"
        :value="selectionMode"
        @change="onModeChange"
      >
        <option value="single">Single</option>
        <option value="multiple">Multiple</option>
      </select>
    </div>
    <div class="shortcut-hints">
      <strong>Shortcuts:</strong>
      <span><kbd>Esc</kbd> to cancel</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SelectionMode } from '../types/element-selector';

interface Props {
  isEnabled: boolean;
  hasSelection: boolean;
  selectionMode: SelectionMode;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'toggle-selection'): void;
  (e: 'clear-selection'): void;
  (e: 'set-selection-mode', mode: SelectionMode): void;
}>();

const onModeChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  emit('set-selection-mode', target.value as SelectionMode);
};
</script>

<style lang="scss" scoped>
.selection-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  padding: 8px;
  background-color: #f1f3f5;
  border-radius: 6px;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

button {
  padding: 6px 12px;
  border: 1px solid #adb5bd;
  background-color: #fff;
  color: #495057;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;

  &.active {
    background-color: #007bff;
    color: #fff;
    border-color: #007bff;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

label {
  font-size: 14px;
  color: #495057;
}

select {
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #ced4da;
}

.shortcut-hints {
  font-size: 12px;
  color: #6c757d;

  kbd {
    display: inline-block;
    padding: 2px 6px;
    font-family: monospace;
    background-color: #e9ecef;
    border: 1px solid #ced4da;
    border-radius: 3px;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
    margin: 0 4px;
  }
}
</style>
]]>