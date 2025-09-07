<template>
  <div class="element-info-panel" v-if="element">
    <header class="panel-header">
      <div class="title">
        <span class="tag">{{ elementLabel }}</span>
      </div>
      <div class="actions">
        <button class="btn" @click="copySelector" title="复制元素选择器">复制选择器</button>
        <button class="btn" @click="copyComputedStyles" title="复制计算样式JSON">复制样式</button>
        <button class="btn" @click="copyInlineStyles" :disabled="!hasInlineStyles" title="复制内联样式JSON">
          复制内联
        </button>
      </div>
    </header>

    <section class="section" v-if="info">
      <h4>盒模型</h4>
      <div class="box-model">
        <div class="margin">
          <span class="label">margin</span>
          <div class="border">
            <span class="label">border</span>
            <div class="padding">
              <span class="label">padding</span>
              <div class="content">
                <span class="label">content</span>
                <div class="values" v-if="info.boxModel">
                  <div class="row">
                    <span>margin</span>
                    <span>{{ info.boxModel.margin.top }} / {{ info.boxModel.margin.right }} / {{ info.boxModel.margin.bottom }} / {{ info.boxModel.margin.left }}</span>
                  </div>
                  <div class="row">
                    <span>border</span>
                    <span>{{ info.boxModel.border.top }} / {{ info.boxModel.border.right }} / {{ info.boxModel.border.bottom }} / {{ info.boxModel.border.left }}</span>
                  </div>
                  <div class="row">
                    <span>padding</span>
                    <span>{{ info.boxModel.padding.top }} / {{ info.boxModel.padding.right }} / {{ info.boxModel.padding.bottom }} / {{ info.boxModel.padding.left }}</span>
                  </div>
                  <div class="row">
                    <span>content</span>
                    <span>{{ info.boxModel.content.width }} × {{ info.boxModel.content.height }}</span>
                  </div>
                </div>
                <div v-else class="values muted">无盒模型信息</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <h4>基本信息</h4>
      <div class="grid">
        <div class="item"><span class="key">标签</span><span class="val">{{ info?.tagName }}</span></div>
        <div class="item"><span class="key">ID</span><span class="val">{{ info?.id || '-' }}</span></div>
        <div class="item"><span class="key">类名</span><span class="val">{{ info?.className || '-' }}</span></div>
        <div class="item"><span class="key">选择器</span><span class="val mono">{{ info?.selector }}</span></div>
        <div class="item"><span class="key">尺寸</span><span class="val">{{ info?.rect.width }} × {{ info?.rect.height }}</span></div>
        <div class="item"><span class="key">位置</span><span class="val">({{ info?.rect.left }}, {{ info?.rect.top }})</span></div>
        <div class="item"><span class="key">可见性</span>
          <span class="val">
            display: {{ info?.visibility.display }},
            visibility: {{ info?.visibility.visibility }},
            opacity: {{ info?.visibility.opacity }}
          </span>
        </div>
      </div>
    </section>

    <section class="section">
      <h4>计算样式</h4>
      <div class="table">
        <div class="thead">
          <div class="th name">属性</div>
          <div class="th value">值</div>
        </div>
        <div class="tbody" v-if="computedList.length">
          <div class="tr" v-for="(pair, idx) in computedList" :key="idx">
            <div class="td name mono">{{ pair.name }}</div>
            <div class="td value mono">{{ pair.value }}</div>
          </div>
        </div>
        <div class="empty" v-else>无计算样式</div>
      </div>
    </section>

    <section class="section" v-if="inlineList.length">
      <h4>内联样式</h4>
      <div class="table">
        <div class="thead">
          <div class="th name">属性</div>
          <div class="th value">值</div>
        </div>
        <div class="tbody">
          <div class="tr" v-for="(pair, idx) in inlineList" :key="idx">
            <div class="td name mono">{{ pair.name }}</div>
            <div class="td value mono">{{ pair.value }}</div>
          </div>
        </div>
      </div>
    </section>

    <footer class="panel-footer" v-if="copyTip">
      <span class="copy-tip">{{ copyTip }}</span>
    </footer>
  </div>

  <div class="element-info-panel empty" v-else>
    <span>未选择元素</span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { ElementStyleInfo } from '@/types/element-selector';
import { extractElementStyles } from '@/core/style-extractor';

interface Props {
  element: Element | null;
}
const props = defineProps<Props>();

const info = ref<ElementStyleInfo | null>(null);
const copyTip = ref<string>('');

watch(
  () => props.element,
  (el) => {
    try {
      info.value = el ? extractElementStyles(el) : null;
    } catch (e) {
      info.value = null;
      console.warn('Failed to extract element styles:', e);
    }
  },
  { immediate: true }
);

const elementLabel = computed(() => {
  if (!props.element) return '';
  const tag = props.element.tagName.toLowerCase();
  const id = (props.element as HTMLElement).id ? `#${(props.element as HTMLElement).id}` : '';
  const cls = (props.element as HTMLElement).className
    ? '.' + (props.element as HTMLElement).className.trim().split(/\s+/).join('.')
    : '';
  return `${tag}${id}${cls}`;
});

const computedList = computed(() => {
  const map = info.value?.computedStyles || {};
  return Object.keys(map)
    .sort()
    .map((k) => ({ name: k, value: map[k] }));
});

const inlineList = computed(() => {
  const map = info.value?.inlineStyles || {};
  return Object.keys(map)
    .sort()
    .map((k) => ({ name: k, value: map[k] }));
});

const hasInlineStyles = computed(() => inlineList.value.length > 0);

async function copy(text: string) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    copyTip.value = '已复制到剪贴板';
  } catch {
    copyTip.value = '复制失败';
  } finally {
    setTimeout(() => (copyTip.value = ''), 1500);
  }
}

function copySelector() {
  const sel = info.value?.selector || '';
  if (sel) copy(sel);
}

function copyComputedStyles() {
  const styles = info.value?.computedStyles || {};
  copy(JSON.stringify(styles, null, 2));
}

function copyInlineStyles() {
  const styles = info.value?.inlineStyles || {};
  if (Object.keys(styles).length) {
    copy(JSON.stringify(styles, null, 2));
  }
}
</script>

<style scoped>
.element-info-panel {
  padding: 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #374151;
}

.element-info-panel.empty {
  padding: 16px;
  text-align: center;
  color: #6b7280;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.title .tag {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  color: #7c3aed;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #ffffff;
  color: #374151;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.section {
  margin-top: 12px;
}
.section h4 {
  margin: 0 0 8px 0;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 6px 12px;
}
.item {
  display: contents;
}
.item .key {
  color: #6b7280;
  font-size: 12px;
}
.item .val {
  font-size: 12px;
}
.mono {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.table {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}
.thead, .tr {
  display: grid;
  grid-template-columns: 180px 1fr;
}
.thead {
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}
.th, .td {
  padding: 6px 8px;
  font-size: 12px;
}
.td.name { color: #6b7280; }
.td.value { color: #111827; }
.empty {
  padding: 10px;
  font-size: 12px;
  color: #6b7280;
}

.box-model {
  --c-margin: #fde68a;
  --c-border: #c7d2fe;
  --c-padding: #bbf7d0;
  --c-content: #fbcfe8;
  display: flex;
  align-items: center;
  justify-content: center;
}
.margin {
  background: var(--c-margin);
  padding: 6px;
}
.border {
  background: var(--c-border);
  padding: 6px;
}
.padding {
  background: var(--c-padding);
  padding: 6px;
}
.content {
  background: var(--c-content);
  padding: 10px;
  min-width: 160px;
  text-align: center;
}
.label {
  display: inline-block;
  font-size: 11px;
  color: #374151;
  margin-bottom: 4px;
}
.values {
  margin-top: 8px;
  font-size: 12px;
}
.values .row {
  display: flex;
  justify-content: space-between;
  color: #374151;
}
.muted {
  color: #9ca3af;
}

.panel-footer {
  margin-top: 10px;
  text-align: right;
}
.copy-tip {
  font-size: 12px;
  color: #10b981;
}
</style>