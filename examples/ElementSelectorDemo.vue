<template>
  <div class="demo-page">
    <div class="demo-layout">
      <!-- 左侧：选择器面板与状态 -->
      <aside class="left-panel">
        <ElementSelector
          :auto-enable="false"
          :max-selection-count="10"
          :highlight-color="'#3b82f6'"
          :persist-selection="true"
          @selection-change="handleSelectionChange"
          @active-element-change="handleActiveElementChange"
          @error="handleError"
        />

        <div class="panel-section">
          <h4>当前状态</h4>
          <div class="status-line">
            <span>已选择：</span>
            <strong>{{ selectedElements.length }}</strong>
          </div>
          <div class="status-line" v-if="activeElementTag">
            <span>当前元素：</span>
            <code class="mono">{{ activeElementTag }}</code>
          </div>
          <div v-if="lastError" class="error-box">
            <span class="error-icon">⚠️</span>
            <span class="error-text">{{ lastError.message }}</span>
          </div>
        </div>

        <div class="panel-section">
          <h4>快捷键</h4>
          <ul class="tips">
            <li>Tab：切换单选/多选模式</li>
            <li>Esc：退出选择模式</li>
            <li>Delete/Backspace：清空选择</li>
          </ul>
        </div>
      </aside>

      <!-- 右侧：可交互内容区 -->
      <section class="right-content">
        <h2>ElementSelector 演示区域</h2>
        <p>将鼠标移动到元素上可观察高亮，点击进行选择。使用左侧面板按钮控制启用/禁用、模式切换与清空。</p>

        <div class="section">
          <h3>文本内容</h3>
          <p class="hl">这是一段高亮文本，用于观察样式信息提取。</p>
          <p>普通段落文本，便于测试不同层级与结构。</p>
        </div>

        <div class="section">
          <h3>按钮组</h3>
          <div class="btn-group">
            <button class="btn primary">主要按钮</button>
            <button class="btn secondary">次要按钮</button>
            <button class="btn success">成功按钮</button>
            <button class="btn danger">危险按钮</button>
          </div>
        </div>

        <div class="section">
          <h3>表单元素</h3>
          <form class="form">
            <label class="form-row">
              <span>姓名</span>
              <input type="text" placeholder="请输入姓名" />
            </label>
            <label class="form-row">
              <span>邮箱</span>
              <input type="email" placeholder="请输入邮箱" />
            </label>
            <label class="form-row">
              <span>消息</span>
              <textarea rows="3" placeholder="请输入消息"></textarea>
            </label>
          </form>
        </div>

        <div class="section">
          <h3>列表内容</h3>
          <ul class="list">
            <li>列表项目 1</li>
            <li>列表项目 2</li>
            <li>列表项目 3</li>
            <li>列表项目 4</li>
          </ul>
        </div>

        <div class="section">
          <h3>卡片布局</h3>
          <div class="cards">
            <div class="card">
              <div class="card-header">卡片标题 1</div>
              <div class="card-body">卡片内容区域，可选中其任意子元素。</div>
              <div class="card-footer">
                <button class="btn sm">操作</button>
              </div>
            </div>
            <div class="card">
              <div class="card-header">卡片标题 2</div>
              <div class="card-body">另一个卡片内容，用于测试多选。</div>
              <div class="card-footer">
                <button class="btn sm">操作</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ElementSelector from '../src/components/ElementSelector.vue'

const selectedElements = ref<Element[]>([])
const activeElement = ref<Element | null>(null)
const lastError = ref<Error | null>(null)

const activeElementTag = computed(() => {
  if (!activeElement.value) return ''
  const el = activeElement.value
  const tag = el.tagName.toLowerCase()
  const id = el.id ? `#${el.id}` : ''
  const cls =
    (el as HTMLElement).className
      ? `.${(el as HTMLElement).className.split(' ').join('.')}`
      : ''
  return `${tag}${id}${cls}`
})

function handleSelectionChange(elements: Element[]) {
  selectedElements.value = elements
  // console.log('Selection changed:', elements)
}
function handleActiveElementChange(element: Element | null) {
  activeElement.value = element
  // console.log('Active element:', element)
}
function handleError(error: Error) {
  lastError.value = error
  console.error('ElementSelector error:', error)
}
</script>

<style scoped>
.demo-page {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}
.demo-layout {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
.left-panel {
  position: sticky;
  top: 20px;
  height: fit-content;
}
.panel-section {
  margin-top: 16px;
  padding: 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}
.status-line {
  margin: 6px 0;
  color: #374151;
}
.error-box {
  margin-top: 8px;
  padding: 8px;
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.error-icon { font-size: 14px; }
.error-text { font-size: 13px; }
.right-content {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
h2 {
  color: #2d3748;
  margin-bottom: 12px;
}
.section {
  margin: 18px 0 26px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}
.section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}
h3 {
  color: #374151;
  margin-bottom: 10px;
  font-size: 18px;
  font-weight: 600;
}
.hl {
  background: linear-gradient(120deg, #a8edea 0%, #fed6e3 100%);
  padding: 10px 12px;
  border-radius: 6px;
  margin-bottom: 10px;
}
.btn-group { display: flex; gap: 10px; flex-wrap: wrap; }
.btn {
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all .2s ease;
}
.btn:hover { transform: translateY(-1px); box-shadow: 0 4px 8px rgba(0,0,0,.12); }
.btn.primary { background: #3182ce; color: #fff; }
.btn.secondary { background: #718096; color: #fff; }
.btn.success { background: #38a169; color: #fff; }
.btn.danger { background: #e53e3e; color: #fff; }
.btn.sm { padding: 6px 10px; font-size: 12px; }
.form { display: flex; flex-direction: column; gap: 12px; max-width: 420px; }
.form-row { display: grid; grid-template-columns: 80px 1fr; align-items: center; gap: 8px; }
.form-row span { color: #374151; font-size: 14px; }
.form-row input, .form-row textarea {
  padding: 8px 10px;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color .2s ease;
}
.form-row input:focus, .form-row textarea:focus {
  outline: none; border-color: #3182ce; box-shadow: 0 0 0 3px rgba(49,130,206,.1);
}
.list { list-style: none; padding: 0; }
.list li {
  padding: 8px 12px; margin-bottom: 6px; background: #f7fafc;
  border-left: 3px solid #3182ce; border-radius: 0 4px 4px 0;
}
.cards {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 14px;
}
.card {
  background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,.08); transition: box-shadow .2s ease;
}
.card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.15); }
.card-header { padding: 12px 14px; background: #f7fafc; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #2d3748; }
.card-body { padding: 12px 14px; color: #4a5568; }
.card-footer { padding: 10px 14px; background: #f7fafc; border-top: 1px solid #e2e8f0; text-align: right; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
@media (max-width: 768px) {
  .demo-layout { grid-template-columns: 1fr; gap: 16px; }
  .left-panel { position: static; }
}
</style>