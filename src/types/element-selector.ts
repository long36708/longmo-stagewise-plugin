/**
 * 元素选择器核心类型定义
 */

/**
 * 元素选择模式
 */
export type SelectionMode = 'single' | 'multiple';

/**
 * CSS属性映射类型
 */
export type CSSPropertyMap = Record<string, string>;

/**
 * 元素样式信息接口
 */
export interface ElementStyleInfo {
  element: Element;
  tagName: string;
  className?: string;
  id?: string;
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  computedStyles: CSSPropertyMap;
  inlineStyles: CSSPropertyMap;
  boxModel?: {
    content: { width: number; height: number };
    padding: { top: number; right: number; bottom: number; left: number };
    border: { top: number; right: number; bottom: number; left: number };
    margin: { top: number; right: number; bottom: number; left: number };
  };
  position?: {
    position: string;
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
    transform?: string;
    viewport: { x: number; y: number };
    scroll: { x: number; y: number };
  };
  visibility: {
    display: string;
    visibility: string;
    opacity: number;
    overflow: string;
    clip?: string;
  };
  zIndex?: number;
  selector: string;
}

/**
 * 元素选择状态接口
 */
export interface ElementSelectionState {
  selectedElements: Element[];
  activeElement: Element | null;
  isSelectionEnabled: boolean;
  selectionMode: SelectionMode;
}

/**
 * 选择器配置选项
 */
export interface SelectorConfig {
  highlightColor: string;
  highlightOpacity: number;
  borderWidth: number;
  zIndex: number;
  enableMultiSelect: boolean;
  persistSelection: boolean;
  maxSelectionCount: number;
}

/**
 * 选择器事件类型
 */
export interface SelectorEvents {
  onSelectionChange: (selectedElements: Element[]) => void;
  onActiveElementChange: (element: Element | null) => void;
  onSelectionModeChange: (mode: SelectionMode) => void;
  onError: (error: SelectorError) => void;
}

/**
 * 选择器操作接口
 */
export interface SelectorActions {
  enableSelection: () => void;
  disableSelection: () => void;
  toggleSelection: () => void;
  clearSelection: () => void;
  setSelectionMode: (mode: SelectionMode) => void;
  getSelectedElements: () => Element[];
  getActiveElement: () => Element | null;
  getElementInfo: (element: Element) => ElementStyleInfo;
}

/**
 * 选择器错误类型
 */
export class SelectorError extends Error {
  constructor(
    message: string,
    public code: string,
    public element?: Element
  ) {
    super(message);
    this.name = 'SelectorError';
  }
}

/**
 * 选择器常量
 */
export const SELECTOR_CONSTANTS = {
  DEFAULT_HIGHLIGHT_COLOR: '#3b82f6',
  DEFAULT_HIGHLIGHT_OPACITY: 0.3,
  DEFAULT_BORDER_WIDTH: 2,
  DEFAULT_Z_INDEX: 10000,
  DEFAULT_MAX_SELECTION_COUNT: 10,
  STORAGE_KEY: 'element-selector-selection'
} as const;