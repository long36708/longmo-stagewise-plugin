import { ElementStyleInfo } from '@/types/element-selector';

/**
 * 选择状态持久化管理器
 * 负责将元素选择状态保存到本地存储和从本地存储加载
 */
export class SelectionPersistenceManager {
  private static readonly STORAGE_KEY = 'element-selector-selections';

  /**
   * 保存选择状态到本地存储
   * @param elements 要保存的元素信息数组
   */
  static saveState(elements: ElementStyleInfo[]): void {
    try {
      const serializedState = JSON.stringify(elements, (key, value) => {
        // 特殊处理DOMRect对象，因为它不能被直接序列化
        if (key === 'rect' && value && typeof value === 'object') {
          return {
            x: value.x,
            y: value.y,
            width: value.width,
            height: value.height,
            top: value.top,
            right: value.right,
            bottom: value.bottom,
            left: value.left
          };
        }
        return value;
      });

      localStorage.setItem(this.STORAGE_KEY, serializedState);
    } catch (error) {
      console.warn('Failed to save selection state:', error);
    }
  }

  /**
   * 从本地存储加载选择状态
   * @returns 加载的元素信息数组，如果没有保存的状态则返回空数组
   */
  static loadState(): ElementStyleInfo[] {
    try {
      const serializedState = localStorage.getItem(this.STORAGE_KEY);
      if (!serializedState) return [];

      const elements = JSON.parse(serializedState, (key, value) => {
        // 特殊处理rect对象，将其恢复为DOMRect-like对象
        if (key === 'rect' && value && typeof value === 'object') {
          return {
            x: value.x,
            y: value.y,
            width: value.width,
            height: value.height,
            top: value.top,
            right: value.right,
            bottom: value.bottom,
            left: value.left,
            toJSON: () => value // 添加toJSON方法以避免循环引用
          };
        }
        return value;
      });

      return Array.isArray(elements) ? elements : [];
    } catch (error) {
      console.warn('Failed to load selection state:', error);
      return [];
    }
  }

  /**
   * 清除所有保存的选择状态
   */
  static clearState(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear selection state:', error);
    }
  }

  /**
   * 检查是否有保存的选择状态
   */
  static hasSavedState(): boolean {
    try {
      return localStorage.getItem(this.STORAGE_KEY) !== null;
    } catch (error) {
      console.warn('Failed to check saved state:', error);
      return false;
    }
  }
}