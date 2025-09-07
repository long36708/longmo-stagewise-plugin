/**
 * 错误处理工具：选择/样式提取/跨域 iframe 相关
 *
 * 目标：
 * - 统一创建与标准化 SelectorError
 * - 识别跨域 iframe 相关错误并返回明确错误码
 * - 提供通用错误边界包装器与样式获取保护函数
 */

import { SelectorError } from '@/types/element-selector';

export type ErrorCode =
  | 'INITIALIZATION_ERROR'
  | 'ENABLE_ERROR'
  | 'DISABLE_ERROR'
  | 'MODE_ERROR'
  | 'INFO_ERROR'
  | 'CLEAR_ERROR'
  | 'SAVE_ERROR'
  | 'LOAD_ERROR'
  | 'STYLE_EXTRACT_ERROR'
  | 'CROSS_ORIGIN_IFRAME'
  | 'INVALID_ELEMENT'
  | 'UNKNOWN_ERROR';

export interface ErrorContext {
  action?: string;
  element?: Element | null;
  selector?: string;
  extra?: Record<string, unknown>;
}

/**
 * 创建标准化的 SelectorError
 */
export function createError(
  code: ErrorCode,
  message: string,
  ctx?: ErrorContext
): SelectorError {
  // SelectorError 的构造签名：new SelectorError(message, code, element?)
  return new SelectorError(
    message,
    code as any,
    ctx?.element ?? undefined
  );
}

/**
 * 判断是否跨域相关错误
 */
export function isCrossOriginError(err: unknown): boolean {
  if (!err) return false;
  const e = err as any;
  const msg: string = String(e?.message || e);
  const name: string = String(e?.name || '');
  // 常见跨域提示关键字
  if (
    /cross-?origin|permission denied|Blocked a frame with origin|SecurityError/i.test(msg) ||
    /SecurityError/i.test(name)
  ) {
    return true;
  }
  return false;
}

/**
 * 将任意错误标准化为 SelectorError
 */
export function normalizeError(
  err: unknown,
  fallbackCode: ErrorCode,
  ctx?: ErrorContext
): SelectorError {
  if (err instanceof SelectorError) return err;
  if (isCrossOriginError(err)) {
    return createError(
      'CROSS_ORIGIN_IFRAME',
      (err as any)?.message || '跨域 iframe 访问被阻止',
      ctx
    );
  }
  const message =
    (err as any)?.message ||
    (typeof err === 'string' ? err : '未知错误');
  return createError(fallbackCode || 'UNKNOWN_ERROR', message, ctx);
}

/**
 * 错误边界执行包装器：捕获并标准化错误
 */
export function withErrorBoundary<T>(
  fn: () => T,
  fallbackCode: ErrorCode,
  ctx?: ErrorContext
): T {
  try {
    return fn();
  } catch (err) {
    throw normalizeError(err, fallbackCode, ctx);
  }
}

/**
 * 保护的 getComputedStyle 调用：跨域/安全错误时转换为 SelectorError
 */
export function guardComputeStyles(
  element: Element,
  props?: string[]
): CSSStyleDeclaration | null {
  if (!element || !(element instanceof Element)) {
    throw createError('INVALID_ELEMENT', '无效的元素引用', { element });
  }
  try {
    const view = element.ownerDocument?.defaultView;
    if (!view) return null;
    const styles = view.getComputedStyle(element);
    // 若指定属性，提前访问以触发潜在的跨域/安全异常
    if (styles && props && props.length) {
      // 访问一次，若不可访问会抛异常
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      props[0] && styles.getPropertyValue(props[0]);
    }
    return styles;
  } catch (err) {
    throw normalizeError(err, 'STYLE_EXTRACT_ERROR', { element });
  }
}

/**
 * 通用 tryAccess：安全访问某段逻辑，失败返回 null 或抛出标准化错误
 */
export function tryAccess<T>(
  accessor: () => T,
  onErrorCode: ErrorCode,
  ctx?: ErrorContext,
  returnNullInsteadThrow = true
): T | null {
  try {
    return accessor();
  } catch (err) {
    const normalized = normalizeError(err, onErrorCode, ctx);
    if (returnNullInsteadThrow) {
      // 控制台保留可诊断信息，但不中断业务
      // console.warn('[error-handler] suppressed error:', normalized);
      return null;
    }
    throw normalized;
  }
}

/**
 * 针对 iframe 的访问检查：在尝试访问 contentDocument 前先探测
 */
export function canAccessIFrame(iframe: HTMLIFrameElement): boolean {
  try {
    // 访问 contentDocument 若跨域将抛出 SecurityError
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    iframe.contentDocument?.title;
    return true;
  } catch {
    return false;
  }
}

/**
 * 将原始错误映射为更清晰的用户提示
 */
export function humanizeError(err: SelectorError | unknown): string {
  const e = err instanceof SelectorError ? err : normalizeError(err, 'UNKNOWN_ERROR');
  switch ((e as any).code) {
    case 'CROSS_ORIGIN_IFRAME':
      return '无法访问跨域 iframe 中的内容。请在同源页面中操作或使用允许的上下文。';
    case 'STYLE_EXTRACT_ERROR':
      return '无法提取元素样式信息，请稍后重试或检查元素是否可访问。';
    case 'INVALID_ELEMENT':
      return '目标元素无效，请选择有效的页面元素。';
    case 'ENABLE_ERROR':
      return '无法启用选择模式，请刷新页面后重试。';
    case 'DISABLE_ERROR':
      return '禁用选择模式时出错，请稍后重试。';
    case 'MODE_ERROR':
      return '设置选择模式失败，请检查模式参数是否正确。';
    case 'INFO_ERROR':
      return '获取元素信息失败，请重试或更换元素。';
    case 'CLEAR_ERROR':
      return '清除选择失败，请稍后重试。';
    case 'SAVE_ERROR':
      return '保存选择状态失败，请稍后重试。';
    case 'LOAD_ERROR':
      return '加载已保存状态失败，记录可能已失效。';
    case 'INITIALIZATION_ERROR':
      return '初始化选择器失败，请检查页面环境。';
    default:
      return (e as any)?.message || '发生未知错误';
  }
}

export default {
  createError,
  isCrossOriginError,
  normalizeError,
  withErrorBoundary,
  guardComputeStyles,
  tryAccess,
  canAccessIFrame,
  humanizeError
};