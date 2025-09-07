/**
 * DOM 工具函数
 */

import { ElementStyleInfo, SelectorError } from '@/types/element-selector';

/**
 * 检查元素是否在视口内
 */
export function isElementInViewport(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * 获取元素的样式信息
 */
export function getElementStyleInfo(element: Element): ElementStyleInfo & { boundingRect: DOMRect } {
  try {
    const computedStyle = window.getComputedStyle(element);
    const boundingRect = element.getBoundingClientRect();
    
    // 获取计算样式
    const computedStyles: Record<string, string> = {};
    const styleProperties = [
      'color', 'backgroundColor', 'fontSize', 'fontFamily', 'padding', 
      'margin', 'border', 'width', 'height', 'display', 'position'
    ];
    
    styleProperties.forEach(prop => {
      computedStyles[prop] = computedStyle.getPropertyValue(prop);
    });

    // 获取内联样式
    const inlineStyles: Record<string, string> = {};
    if (element instanceof HTMLElement) {
      for (let i = 0; i < element.style.length; i++) {
        const prop = element.style[i];
        inlineStyles[prop] = element.style.getPropertyValue(prop);
      }
    }

    return {
      element,
      tagName: element.tagName.toLowerCase(),
      className: element.className || undefined,
      id: element.id || undefined,
      rect: {
        x: boundingRect.x,
        y: boundingRect.y,
        width: boundingRect.width,
        height: boundingRect.height,
        top: boundingRect.top,
        right: boundingRect.right,
        bottom: boundingRect.bottom,
        left: boundingRect.left
      },
      boundingRect: boundingRect,
      computedStyles,
      inlineStyles,
      visibility: {
        display: computedStyles.display || 'block',
        visibility: computedStyles.visibility || 'visible',
        opacity: parseFloat(computedStyles.opacity || '1'),
        overflow: computedStyles.overflow || 'visible'
      },
      selector: element.id ? `#${element.id}` : element.tagName.toLowerCase()
    };
  } catch (error) {
    throw new SelectorError(
      `Failed to get style info for element: ${error}`,
      'STYLE_INFO_ERROR',
      element
    );
  }
}

/**
 * 检查元素是否可交互
 */
export function isElementInteractive(element: Element): boolean {
  if (!(element instanceof HTMLElement)) return false;
  
  const interactiveTags = ['a', 'button', 'input', 'select', 'textarea', 'option'];
  const hasInteractiveRole = element.getAttribute('role')?.includes('button') || 
                           element.getAttribute('role')?.includes('link');
  
  return interactiveTags.includes(element.tagName.toLowerCase()) || 
         hasInteractiveRole ||
         element.onclick !== null ||
         element.tabIndex >= 0;
}

/**
 * 安全地获取元素文本内容
 */
export function getSafeTextContent(element: Element): string {
  try {
    return element.textContent?.trim() || '';
  } catch {
    return '';
  }
}

/**
 * 检查元素是否在iframe中
 */
export function isInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

/**
 * 检查元素是否在跨域iframe中
 */
export function isCrossOriginIframe(): boolean {
  try {
    return !window.parent.location.hostname;
  } catch (error) {
    return true;
  }
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay) as any;
  };
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func.apply(null, args);
    }
  };
}