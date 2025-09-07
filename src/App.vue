<template>
  <div id="app">
    <header class="app-header">
      <h1>网页微调插件</h1>
      <p>元素选择器功能演示</p>
    </header>

    <main class="app-main">
      <div class="demo-container">
        <!-- 左侧：选择器控制面板 -->
        <div class="selector-panel">
          <ElementSelector />
        </div>

        <!-- 右侧：演示内容区域 -->
        <div class="demo-content">
          <h2>演示内容区域</h2>
          <p>这是一个用于测试元素选择器的演示页面。您可以使用左侧的控制面板来选择页面中的任何元素。</p>
          
          <div class="demo-section">
            <h3>文本内容</h3>
            <p class="highlight-text">这是一段高亮文本，具有特殊的样式。</p>
            <p>这是普通的段落文本，用于测试选择功能。</p>
          </div>

          <div class="demo-section">
            <h3>按钮组</h3>
            <div class="button-group">
              <button class="btn btn-primary">主要按钮</button>
              <button class="btn btn-secondary">次要按钮</button>
              <button class="btn btn-success">成功按钮</button>
              <button class="btn btn-danger">危险按钮</button>
            </div>
          </div>

          <div class="demo-section">
            <h3>表单元素</h3>
            <form class="demo-form">
              <div class="form-group">
                <label for="name">姓名:</label>
                <input type="text" id="name" placeholder="请输入姓名">
              </div>
              <div class="form-group">
                <label for="email">邮箱:</label>
                <input type="email" id="email" placeholder="请输入邮箱">
              </div>
              <div class="form-group">
                <label for="message">消息:</label>
                <textarea id="message" rows="3" placeholder="请输入消息"></textarea>
              </div>
            </form>
          </div>

          <div class="demo-section">
            <h3>列表内容</h3>
            <ul class="demo-list">
              <li>列表项目 1</li>
              <li>列表项目 2</li>
              <li>列表项目 3</li>
              <li>列表项目 4</li>
            </ul>
          </div>

          <div class="demo-section">
            <h3>卡片布局</h3>
            <div class="card-container">
              <div class="card">
                <div class="card-header">卡片标题 1</div>
                <div class="card-body">这是卡片的内容区域，包含一些示例文本。</div>
                <div class="card-footer">
                  <button class="btn btn-sm">操作</button>
                </div>
              </div>
              <div class="card">
                <div class="card-header">卡片标题 2</div>
                <div class="card-body">另一个卡片的内容，用于测试多元素选择。</div>
                <div class="card-footer">
                  <button class="btn btn-sm">操作</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 状态显示已移入 ElementSelector 组件 -->
  </div>
</template>

<script setup lang="ts">
import ElementSelector from './components/ElementSelector.vue';

// App.vue 现在只作为 ElementSelector 组件的宿主和演示内容的容器。
// 所有选择器相关的逻辑和状态都已封装在 ElementSelector.vue 及其组合式函数中。
</script>

<style lang="scss">
// 全局样式重置
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f5f5;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  h1 {
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  p {
    font-size: 16px;
    opacity: 0.9;
  }
}

.app-main {
  flex: 1;
  padding: 20px;
}

.demo-container {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.selector-panel {
  position: sticky;
  top: 20px;
  height: fit-content;
}

.demo-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  h2 {
    color: #2d3748;
    margin-bottom: 16px;
    font-size: 24px;
  }

  > p {
    color: #4a5568;
    margin-bottom: 24px;
    font-size: 16px;
  }
}

.demo-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }

  h3 {
    color: #2d3748;
    margin-bottom: 16px;
    font-size: 18px;
    font-weight: 600;
  }
}

.highlight-text {
  background: linear-gradient(120deg, #a8edea 0%, #fed6e3 100%);
  padding: 12px 16px;
  border-radius: 6px;
  font-weight: 500;
  margin-bottom: 12px;
}

.button-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  &.btn-primary {
    background: #3182ce;
    color: white;
  }

  &.btn-secondary {
    background: #718096;
    color: white;
  }

  &.btn-success {
    background: #38a169;
    color: white;
  }

  &.btn-danger {
    background: #e53e3e;
    color: white;
  }

  &.btn-sm {
    padding: 6px 12px;
    font-size: 12px;
  }
}

.demo-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 400px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;

  label {
    font-weight: 500;
    color: #2d3748;
    font-size: 14px;
  }

  input, textarea {
    padding: 8px 12px;
    border: 1px solid #cbd5e0;
    border-radius: 4px;
    font-size: 14px;
    transition: border-color 0.2s ease;

    &:focus {
      outline: none;
      border-color: #3182ce;
      box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
    }
  }
}

.demo-list {
  list-style: none;
  padding: 0;

  li {
    padding: 8px 12px;
    margin-bottom: 4px;
    background: #f7fafc;
    border-left: 3px solid #3182ce;
    border-radius: 0 4px 4px 0;
    transition: background-color 0.2s ease;

    &:hover {
      background: #edf2f7;
    }
  }
}

.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.card-header {
  padding: 16px;
  background: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 600;
  color: #2d3748;
}

.card-body {
  padding: 16px;
  color: #4a5568;
  line-height: 1.5;
}

.card-footer {
  padding: 12px 16px;
  background: #f7fafc;
  border-top: 1px solid #e2e8f0;
  text-align: right;
}

.status-bar {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #2d3748;
  color: white;
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

// 响应式设计
@media (max-width: 768px) {
  .demo-container {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .selector-panel {
    position: static;
  }

  .app-header {
    padding: 16px;

    h1 {
      font-size: 24px;
    }

    p {
      font-size: 14px;
    }
  }

  .demo-content {
    padding: 16px;
  }

  .button-group {
    gap: 8px;
  }

  .card-container {
    grid-template-columns: 1fr;
  }
}
</style>