<template>
  <div class="element-info" :class="{ compact }">
    <div v-if="elementInfo" class="info-content">
      <!-- 基本信息 -->
      <div class="basic-info">
        <div class="info-row">
          <span class="label">标签:</span>
          <span class="value tag-name">{{ elementInfo.tagName }}</span>
        </div>
        
        <div v-if="elementInfo.id" class="info-row">
          <span class="label">ID:</span>
          <span class="value element-id">#{{ elementInfo.id }}</span>
        </div>
        
        <div v-if="elementInfo.className" class="info-row">
          <span class="label">类名:</span>
          <span class="value class-names">{{ formatClassName(elementInfo.className) }}</span>
        </div>
      </div>

      <!-- 尺寸信息 -->
      <div v-if="!compact" class="dimensions-info">
        <h5>尺寸位置</h5>
        <div class="dimensions-grid">
          <div class="dimension-item">
            <span class="dim-label">宽度</span>
            <span class="dim-value">{{ Math.round(elementInfo.rect.width) }}px</span>
          </div>
          <div class="dimension-item">
            <span class="dim-label">高度</span>
            <span class="dim-value">{{ Math.round(elementInfo.rect.height) }}px</span>
          </div>
          <div class="dimension-item">
            <span class="dim-label">X坐标</span>
            <span class="dim-value">{{ Math.round(elementInfo.rect.left) }}px</span>
          </div>
          <div class="dimension-item">
            <span class="dim-label">Y坐标</span>
            <span class="dim-value">{{ Math.round(elementInfo.rect.top) }}px</span>
          </div>
        </div>
      </div>

      <!-- 样式信息 -->
      <div v-if="!compact && hasStyles" class="styles-info">
        <div class="styles-section">
          <h5>
            计算样式
            <button 
              @click="toggleComputedStyles" 
              class="toggle-btn"
              :class="{ active: showComputedStyles }"
            >
              {{ showComputedStyles ? '收起' : '展开' }}
            </button>
          </h5>
          <div v-if="showComputedStyles" class="styles-list">
            <div 
              v-for="[property, value] in computedStyleEntries" 
              :key="property"
              class="style-item"
            >
              <span class="style-property">{{ property }}:</span>
              <span class="style-value">{{ value }}</span>
            </div>
          </div>
        </div>

        <div v-if="hasInlineStyles" class="styles-section">
          <h5>
            内联样式
            <button 
              @click="toggleInlineStyles" 
              class="toggle-btn"
              :class="{ active: showInlineStyles }"
            >
              {{ showInlineStyles ? '收起' : '展开' }}
            </button>
          </h5>
          <div v-if="showInlineStyles" class="styles-list">
            <div 
              v-for="[property, value] in inlineStyleEntries" 
              :key="property"
              class="style-item"
            >
              <span class="style-property">{{ property }}:</span>
              <span class="style-value">{{ value }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 紧凑模式下的简要信息 -->
      <div v-if="compact" class="compact-info">
        <span class="compact-dimensions">
          {{ Math.round(elementInfo.rect.width) }} × {{ Math.round(elementInfo.rect.height) }}px
        </span>
        <span v-if="elementInfo.computedStyles.color" class="compact-color">
          {{ elementInfo.computedStyles.color }}
        </span>
      </div>
    </div>

    <div v-else class="no-info">
      <span>无法获取元素信息</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { getElementStyleInfo } from '@/utils/dom-utils';
import type { ElementStyleInfo } from '@/types/element-selector';

// Props
interface Props {
  element: Element;
  compact?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  compact: false
});

// 响应式状态
const showComputedStyles = ref(false);
const showInlineStyles = ref(false);

// 计算属性
const elementInfo = computed((): ElementStyleInfo | null => {
  try {
    return getElementStyleInfo(props.element);
  } catch (error) {
    console.error('Failed to get element info:', error);
    return null;
  }
});

const computedStyleEntries = computed(() => {
  if (!elementInfo.value) return [];
  return Object.entries(elementInfo.value.computedStyles)
    .filter(([, value]) => value && value !== 'none' && value !== 'auto')
    .sort(([a], [b]) => a.localeCompare(b));
});

const inlineStyleEntries = computed(() => {
  if (!elementInfo.value) return [];
  return Object.entries(elementInfo.value.inlineStyles)
    .filter(([, value]) => value && value !== 'none' && value !== 'auto')
    .sort(([a], [b]) => a.localeCompare(b));
});

const hasStyles = computed(() => computedStyleEntries.value.length > 0);
const hasInlineStyles = computed(() => inlineStyleEntries.value.length > 0);

// 方法
const formatClassName = (className: string): string => {
  return className
    .split(' ')
    .filter(cls => cls.trim())
    .map(cls => `.${cls}`)
    .join(' ');
};

const toggleComputedStyles = () => {
  showComputedStyles.value = !showComputedStyles.value;
};

const toggleInlineStyles = () => {
  showInlineStyles.value = !showInlineStyles.value;
};
</script>

<style scoped lang="scss">
.element-info {
  font-size: 12px;
  color: #374151;

  &.compact {
    .info-content {
      padding: 4px 0;
    }
  }
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.basic-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 16px;
}

.label {
  font-weight: 500;
  color: #6b7280;
  min-width: 40px;
  font-size: 11px;
}

.value {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 11px;
  
  &.tag-name {
    color: #dc2626;
    font-weight: 600;
  }
  
  &.element-id {
    color: #059669;
    font-weight: 600;
  }
  
  &.class-names {
    color: #7c3aed;
    font-weight: 500;
  }
}

.dimensions-info {
  h5 {
    margin: 0 0 6px 0;
    font-size: 11px;
    font-weight: 600;
    color: #374151;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}

.dimensions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
}

.dimension-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 4px;
  background: #f3f4f6;
  border-radius: 2px;
}

.dim-label {
  font-size: 10px;
  color: #6b7280;
}

.dim-value {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 10px;
  color: #374151;
  font-weight: 500;
}

.styles-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.styles-section {
  h5 {
    margin: 0 0 4px 0;
    font-size: 11px;
    font-weight: 600;
    color: #374151;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.toggle-btn {
  background: none;
  border: 1px solid #d1d5db;
  color: #6b7280;
  font-size: 9px;
  padding: 2px 6px;
  border-radius: 2px;
  cursor: pointer;
  text-transform: none;
  letter-spacing: normal;
  font-weight: normal;
  transition: all 0.2s ease;

  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }

  &.active {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
  }
}

.styles-list {
  max-height: 120px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: #fafafa;
}

.style-item {
  display: flex;
  padding: 2px 6px;
  border-bottom: 1px solid #e5e7eb;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:nth-child(even) {
    background: #f9fafb;
  }
}

.style-property {
  font-weight: 500;
  color: #7c3aed;
  min-width: 80px;
  font-size: 10px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.style-value {
  color: #059669;
  font-size: 10px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  word-break: break-all;
  margin-left: 4px;
}

.compact-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  color: #6b7280;
}

.compact-dimensions {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
}

.compact-color {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  color: #059669;
}

.no-info {
  padding: 8px;
  text-align: center;
  color: #9ca3af;
  font-style: italic;
  font-size: 11px;
}

/* 滚动条样式 */
.styles-list::-webkit-scrollbar {
  width: 4px;
}

.styles-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.styles-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.styles-list::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>