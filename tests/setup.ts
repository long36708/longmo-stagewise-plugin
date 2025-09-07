import { afterEach } from 'vitest';

afterEach(() => {
  // 清理 DOM，避免测试间污染
  if (typeof document !== 'undefined') {
    document.body.innerHTML = '';
  }
});