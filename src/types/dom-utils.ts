/**
 * DOM 工具类型定义
 */

/**
 * DOM 工具配置选项
 */
export interface DOMUtilsConfig {
  /** 是否启用调试模式 */
  debug?: boolean;
  /** 默认查询选项 */
  defaultQueryOptions?: ElementQueryOptions;
  /** 样式计算选项 */
  styleOptions?: StyleComputationOptions;
  /** 观察器选项 */
  observerOptions?: DOMObserverOptions;
}

/**
 * CSS 属性映射类型
 */
export type CSSPropertyMap = {
  [property: string]: string;
};

/**
 * 常用CSS属性名称
 */
export type CSSPropertyName = 
  | 'color'
  | 'backgroundColor'
  | 'fontSize'
  | 'fontFamily'
  | 'fontWeight'
  | 'lineHeight'
  | 'padding'
  | 'paddingTop'
  | 'paddingRight'
  | 'paddingBottom'
  | 'paddingLeft'
  | 'margin'
  | 'marginTop'
  | 'marginRight'
  | 'marginBottom'
  | 'marginLeft'
  | 'border'
  | 'borderTop'
  | 'borderRight'
  | 'borderBottom'
  | 'borderLeft'
  | 'borderWidth'
  | 'borderColor'
  | 'borderStyle'
  | 'borderRadius'
  | 'width'
  | 'height'
  | 'minWidth'
  | 'minHeight'
  | 'maxWidth'
  | 'maxHeight'
  | 'display'
  | 'position'
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | 'zIndex'
  | 'opacity'
  | 'visibility'
  | 'overflow'
  | 'overflowX'
  | 'overflowY'
  | 'textAlign'
  | 'textDecoration'
  | 'textTransform'
  | 'whiteSpace'
  | 'wordWrap'
  | 'wordBreak'
  | 'boxSizing'
  | 'boxShadow'
  | 'transform'
  | 'transition'
  | 'animation';

/**
 * 元素矩形信息类型
 */
export interface ElementRect {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * 元素位置信息
 */
export interface ElementPosition {
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  clientX: number;
  clientY: number;
  pageX: number;
  pageY: number;
}

/**
 * 选择事件类型
 */
export interface SelectionEvent {
  type: 'select' | 'deselect' | 'hover' | 'unhover' | 'clear';
  element: Element;
  target: Element;
  timestamp: number;
  position: ElementPosition;
  modifiers: {
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
    metaKey: boolean;
  };
}

/**
 * 元素查询选项
 */
export interface ElementQueryOptions {
  includeHidden?: boolean;
  includeDisabled?: boolean;
  maxDepth?: number;
  selector?: string;
  excludeSelector?: string;
}

/**
 * 元素过滤器函数类型
 */
export type ElementFilter = (element: Element) => boolean;

/**
 * 元素遍历回调函数类型
 */
export type ElementTraverseCallback = (element: Element, depth: number, parent: Element | null) => boolean | void;

/**
 * DOM 变化观察选项
 */
export interface DOMObserverOptions {
  childList?: boolean;
  attributes?: boolean;
  attributeOldValue?: boolean;
  characterData?: boolean;
  characterDataOldValue?: boolean;
  subtree?: boolean;
  attributeFilter?: string[];
}

/**
 * DOM 变化回调函数类型
 */
export type DOMChangeCallback = (mutations: MutationRecord[], observer: MutationObserver) => void;

/**
 * 视口信息类型
 */
export interface ViewportInfo {
  width: number;
  height: number;
  scrollX: number;
  scrollY: number;
  devicePixelRatio: number;
}

/**
 * 元素可见性状态
 */
export interface ElementVisibility {
  isVisible: boolean;
  isInViewport: boolean;
  visibilityRatio: number;
  intersectionRect: ElementRect | null;
}

/**
 * 样式计算选项
 */
export interface StyleComputationOptions {
  includeInherited?: boolean;
  includeDefault?: boolean;
  properties?: CSSPropertyName[];
  pseudoElement?: string | null;
}

/**
 * 元素层级信息
 */
export interface ElementHierarchy {
  element: Element;
  depth: number;
  path: string;
  selector: string;
  parent: Element | null;
  children: Element[];
  siblings: Element[];
}

/**
 * 错误类型枚举
 */
export enum DOMUtilsErrorType {
  ELEMENT_NOT_FOUND = 'ELEMENT_NOT_FOUND',
  INVALID_SELECTOR = 'INVALID_SELECTOR',
  COMPUTATION_FAILED = 'COMPUTATION_FAILED',
  OBSERVER_FAILED = 'OBSERVER_FAILED',
  CROSS_ORIGIN_ERROR = 'CROSS_ORIGIN_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED'
}

/**
 * DOM 工具错误类
 */
export class DOMUtilsError extends Error {
  constructor(
    message: string,
    public type: DOMUtilsErrorType,
    public element?: Element,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'DOMUtilsError';
  }
}