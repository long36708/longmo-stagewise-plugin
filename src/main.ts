import { createApp } from 'vue'
import App from './App.vue'

// 创建Vue应用实例
const app = createApp(App)

// 挂载应用
app.mount('#app')

// 开发环境下的调试信息
if (import.meta.env.DEV) {
  console.log('🚀 Element Selector Plugin loaded in development mode')
}