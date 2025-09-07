import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [
    vue(),
    // 生成类型声明到 dist/types，并插入 types 入口
    dts({
      entryRoot: 'src',
      include: ['src'],
      outDir: 'dist/types',
      insertTypesEntry: true,
      cleanVueFileName: true,
      copyDtsFiles: true
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    sourcemap: true,
    cssCodeSplit: true,
    lib: {
      // 统一从 src/index.ts 作为库入口导出组件与API
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'LongmoStagewisePlugin',
      fileName: (format) => `longmo-stagewise-plugin.${format}.js`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      // 将 vue 视为外部依赖
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        },
        // 资源命名（包含抽取出的样式）
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'style.css';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  }
});