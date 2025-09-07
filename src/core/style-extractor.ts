/**
 * 元素样式信息提取器
 * 负责提取和格式化DOM元素的样式信息
 */

import { ElementStyleInfo, CSSPropertyMap } from '@/types/element-selector';
import { ElementRect } from '@/types/dom-utils';

export interface StyleExtractorConfig {
  /** 是否包含计算样式 */
  includeComputedStyles?: boolean;
  /** 是否包含内联样式 */
  includeInlineStyles?: boolean;
  /** 是否包含盒模型信息 */
  includeBoxModel?: boolean;
  /** 是否包含位置信息 */
  includePosition?: boolean;
  /** 需要提取的CSS属性列表，为空则提取所有 */
  cssProperties?: string[];
  /** 是否格式化数值 */
  formatValues?: boolean;
}

export class StyleExtractor {
  private config: Required<StyleExtractorConfig>;

  constructor(config: StyleExtractorConfig = {}) {
    this.config = {
      includeComputedStyles: true,
      includeInlineStyles: true,
      includeBoxModel: true,
      includePosition: true,
      cssProperties: [],
      formatValues: true,
      ...config
    };
  }

  /**
   * 提取元素的完整样式信息
   */
  extractElementStyleInfo(element: Element): ElementStyleInfo {
    const htmlElement = element as HTMLElement;
    const computedStyle = window.getComputedStyle(htmlElement);
    const rect = htmlElement.getBoundingClientRect();

    return {
      element,
      tagName: element.tagName.toLowerCase(),
      id: element.id || undefined,
      className: element.className || undefined,
      rect: this.extractElementRect(rect),
      computedStyles: this.config.includeComputedStyles 
        ? this.extractComputedStyles(computedStyle) 
        : {},
      inlineStyles: this.config.includeInlineStyles 
        ? this.extractInlineStyles(htmlElement) 
        : {},
      boxModel: this.config.includeBoxModel 
        ? this.extractBoxModel(computedStyle, rect) 
        : undefined,
      position: this.config.includePosition 
        ? this.extractPositionInfo(computedStyle, rect) 
        : undefined,
      visibility: this.extractVisibilityInfo(computedStyle),
      zIndex: this.extractZIndex(computedStyle),
      selector: this.generateSelector(element)
    };
  }

  /**
   * 提取元素矩形信息
   */
  private extractElementRect(rect: DOMRect): ElementRect {
    return {
      x: this.formatValue(rect.x),
      y: this.formatValue(rect.y),
      width: this.formatValue(rect.width),
      height: this.formatValue(rect.height),
      top: this.formatValue(rect.top),
      right: this.formatValue(rect.right),
      bottom: this.formatValue(rect.bottom),
      left: this.formatValue(rect.left)
    };
  }

  /**
   * 提取计算样式
   */
  private extractComputedStyles(computedStyle: CSSStyleDeclaration): CSSPropertyMap {
    const styles: CSSPropertyMap = {};
    const properties = this.config.cssProperties.length > 0 
      ? this.config.cssProperties 
      : this.getRelevantCSSProperties();

    for (const property of properties) {
      const value = computedStyle.getPropertyValue(property);
      if (value && value !== 'auto' && value !== 'normal') {
        styles[property] = this.formatCSSValue(property, value);
      }
    }

    return styles;
  }

  /**
   * 提取内联样式
   */
  private extractInlineStyles(element: HTMLElement): CSSPropertyMap {
    const styles: CSSPropertyMap = {};
    const inlineStyle = element.style;

    for (let i = 0; i < inlineStyle.length; i++) {
      const property = inlineStyle[i];
      const value = inlineStyle.getPropertyValue(property);
      if (value) {
        styles[property] = this.formatCSSValue(property, value);
      }
    }

    return styles;
  }

  /**
   * 提取盒模型信息
   */
  private extractBoxModel(computedStyle: CSSStyleDeclaration, rect: DOMRect) {
    return {
      content: {
        width: this.formatValue(rect.width),
        height: this.formatValue(rect.height)
      },
      padding: {
        top: this.parsePixelValue(computedStyle.paddingTop),
        right: this.parsePixelValue(computedStyle.paddingRight),
        bottom: this.parsePixelValue(computedStyle.paddingBottom),
        left: this.parsePixelValue(computedStyle.paddingLeft)
      },
      border: {
        top: this.parsePixelValue(computedStyle.borderTopWidth),
        right: this.parsePixelValue(computedStyle.borderRightWidth),
        bottom: this.parsePixelValue(computedStyle.borderBottomWidth),
        left: this.parsePixelValue(computedStyle.borderLeftWidth)
      },
      margin: {
        top: this.parsePixelValue(computedStyle.marginTop),
        right: this.parsePixelValue(computedStyle.marginRight),
        bottom: this.parsePixelValue(computedStyle.marginBottom),
        left: this.parsePixelValue(computedStyle.marginLeft)
      }
    };
  }

  /**
   * 提取位置信息
   */
  private extractPositionInfo(computedStyle: CSSStyleDeclaration, rect: DOMRect) {
    return {
      position: computedStyle.position,
      top: computedStyle.top !== 'auto' ? computedStyle.top : undefined,
      right: computedStyle.right !== 'auto' ? computedStyle.right : undefined,
      bottom: computedStyle.bottom !== 'auto' ? computedStyle.bottom : undefined,
      left: computedStyle.left !== 'auto' ? computedStyle.left : undefined,
      transform: computedStyle.transform !== 'none' ? computedStyle.transform : undefined,
      viewport: {
        x: this.formatValue(rect.x),
        y: this.formatValue(rect.y)
      },
      scroll: {
        x: window.pageXOffset,
        y: window.pageYOffset
      }
    };
  }

  /**
   * 提取可见性信息
   */
  private extractVisibilityInfo(computedStyle: CSSStyleDeclaration) {
    return {
      display: computedStyle.display,
      visibility: computedStyle.visibility,
      opacity: parseFloat(computedStyle.opacity),
      overflow: computedStyle.overflow,
      clip: computedStyle.clip !== 'auto' ? computedStyle.clip : undefined
    };
  }

  /**
   * 提取z-index信息
   */
  private extractZIndex(computedStyle: CSSStyleDeclaration): number | undefined {
    const zIndex = computedStyle.zIndex;
    return zIndex !== 'auto' ? parseInt(zIndex, 10) : undefined;
  }

  /**
   * 生成元素选择器
   */
  private generateSelector(element: Element): string {
    // 优先使用ID
    if (element.id) {
      return `#${element.id}`;
    }

    // 使用类名
    if (element.className) {
      const classes = element.className.trim().split(/\s+/);
      if (classes.length > 0) {
        return `${element.tagName.toLowerCase()}.${classes.join('.')}`;
      }
    }

    // 使用标签名和位置
    const parent = element.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children);
      const sameTagSiblings = siblings.filter(sibling => 
        sibling.tagName === element.tagName
      );
      
      if (sameTagSiblings.length > 1) {
        const sameTagIndex = sameTagSiblings.indexOf(element);
        return `${element.tagName.toLowerCase()}:nth-of-type(${sameTagIndex + 1})`;
      }
    }

    return element.tagName.toLowerCase();
  }

  /**
   * 获取相关的CSS属性列表
   */
  private getRelevantCSSProperties(): string[] {
    return [
      // 布局属性
      'display', 'position', 'float', 'clear',
      'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
      'top', 'right', 'bottom', 'left',
      'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
      'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
      
      // 边框属性
      'border', 'border-width', 'border-style', 'border-color',
      'border-top', 'border-right', 'border-bottom', 'border-left',
      'border-radius',
      
      // 背景属性
      'background', 'background-color', 'background-image', 'background-size',
      'background-position', 'background-repeat',
      
      // 文本属性
      'color', 'font-family', 'font-size', 'font-weight', 'font-style',
      'line-height', 'text-align', 'text-decoration', 'text-transform',
      
      // 可见性属性
      'visibility', 'opacity', 'z-index', 'overflow',
      
      // 变换属性
      'transform', 'transform-origin', 'transition', 'animation'
    ];
  }

  /**
   * 格式化CSS值
   */
  private formatCSSValue(property: string, value: string): string {
    if (!this.config.formatValues) {
      return value;
    }

    // 格式化像素值
    if (value.endsWith('px')) {
      const numValue = parseFloat(value);
      return `${this.formatValue(numValue)}px`;
    }

    // 格式化百分比值
    if (value.endsWith('%')) {
      const numValue = parseFloat(value);
      return `${this.formatValue(numValue)}%`;
    }

    // 格式化颜色值
    if (property.includes('color') || property === 'background') {
      return this.formatColorValue(value);
    }

    return value;
  }

  /**
   * 格式化颜色值
   */
  private formatColorValue(value: string): string {
    // RGB转换为十六进制
    const rgbMatch = value.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      const [, r, g, b] = rgbMatch;
      const hex = [r, g, b]
        .map(x => parseInt(x, 10).toString(16).padStart(2, '0'))
        .join('');
      return `#${hex}`;
    }

    return value;
  }

  /**
   * 解析像素值
   */
  private parsePixelValue(value: string): number {
    const numValue = parseFloat(value);
    return this.formatValue(numValue);
  }

  /**
   * 格式化数值
   */
  private formatValue(value: number): number {
    return Math.round(value * 100) / 100;
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<StyleExtractorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取当前配置
   */
  getConfig(): StyleExtractorConfig {
    return { ...this.config };
  }
}

// 默认样式提取器实例
export const defaultStyleExtractor = new StyleExtractor();

// 工具函数
export function extractElementStyles(
  element: Element, 
  config?: StyleExtractorConfig
): ElementStyleInfo {
  const extractor = config ? new StyleExtractor(config) : defaultStyleExtractor;
  return extractor.extractElementStyleInfo(element);
}

export function createStyleExtractor(config: StyleExtractorConfig): StyleExtractor {
  return new StyleExtractor(config);
}