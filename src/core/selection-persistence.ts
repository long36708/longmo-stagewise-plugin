import { ElementStyleInfo } from '@/types/element-selector';

/**
 * 选择状态持久化管理器
 * 负责将元素选择状态保存到localStorage并在需要时恢复
 */
export class SelectionPersistenceManager {
  private static readonly STORAGE_KEY = 'element_selector_state';
  private static readonly TIMESTAMP_KEY = 'element_selector_timestamp';

  /**
   * 保存选择状态到localStorage
   * @param selections 元素选择状态数组
   * @returns 是否保存成功
   */
  static saveState(selections: ElementStyleInfo[]): boolean {
    try {
      // 仅持久化可序列化且用于恢复所需的字段，避免序列化 DOM 元素
      const persistable = selections.map(s => ({
        selector: s.selector || '',
        id: s.id || '',
        tagName: s.tagName || '',
        className: s.className || '',
        rect: s.rect,
        visibility: s.visibility
      }));

      const serializedState = JSON.stringify({
        selections: persistable,
        timestamp: new Date().toISOString()
      });

      localStorage.setItem(this.STORAGE_KEY, serializedState);
      localStorage.setItem(this.TIMESTAMP_KEY, new Date().toISOString());
      return true;
    } catch (error) {
      console.error('Failed to save selection state:', error);
      return false;
    }
  }

  /**
   * 从localStorage加载保存的选择状态
   * @returns 加载的选择状态数组，如果不存在则返回空数组
   */
  static loadState(): ElementStyleInfo[] {
    try {
      const serializedState = localStorage.getItem(this.STORAGE_KEY);
      if (!serializedState) {
        return [];
      }

      const parsedState = JSON.parse(serializedState);

      // 验证数据结构
      if (!parsedState.selections || !Array.isArray(parsedState.selections)) {
        this.clearState();
        return [];
      }

      // 返回用于恢复的精简对象（不包含 element 引用）
      const sanitized = parsedState.selections.map((s: any) => ({
        element: undefined,
        tagName: s.tagName || '',
        className: s.className || '',
        id: s.id || '',
        rect: s.rect,
        computedStyles: {},
        inlineStyles: {},
        visibility: s.visibility || { display: 'block', visibility: 'visible', opacity: 1, overflow: 'visible' },
        selector: s.selector || ''
      })) as ElementStyleInfo[];

      return sanitized;
    } catch (error) {
      console.error('Failed to load selection state:', error);
      this.clearState();
      return [];
    }
  }

  /**
   * 检查是否存在保存的状态
   * @returns 是否存在有效的保存状态
   */
  static hasSavedState(): boolean {
    try {
      const state = localStorage.getItem(this.STORAGE_KEY);
      const timestamp = localStorage.getItem(this.TIMESTAMP_KEY);
      
      return !!state && !!timestamp;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取状态保存的时间戳
   * @returns 时间戳字符串，如果不存在则返回null
   */
  static getStateTimestamp(): string | null {
    try {
      return localStorage.getItem(this.TIMESTAMP_KEY);
    } catch (error) {
      return null;
    }
  }

  /**
   * 清除所有保存的状态
   */
  static clearState(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.TIMESTAMP_KEY);
    } catch (error) {
      console.error('Failed to clear selection state:', error);
    }
  }

  /**
   * 验证保存的状态是否有效（未过期）
   * @param maxAgeHours 最大有效小时数，默认24小时
   * @returns 状态是否有效
   */
  static isStateValid(maxAgeHours: number = 24): boolean {
    try {
      const timestamp = this.getStateTimestamp();
      if (!timestamp) {
        return false;
      }

      const savedTime = new Date(timestamp);
      const currentTime = new Date();
      const ageInHours = (currentTime.getTime() - savedTime.getTime()) / (1000 * 60 * 60);

      return ageInHours <= maxAgeHours;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取状态信息摘要
   * @returns 状态信息对象
   */
  static getStateInfo(): {
    hasState: boolean;
    timestamp: string | null;
    isValid: boolean;
    selectionCount: number;
  } {
    const hasState = this.hasSavedState();
    const timestamp = this.getStateTimestamp();
    const isValid = this.isStateValid();
    const selections = this.loadState();
    
    return {
      hasState,
      timestamp,
      isValid,
      selectionCount: selections.length
    };
  }
}