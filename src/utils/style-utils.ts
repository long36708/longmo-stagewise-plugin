/**
 * 样式工具函数：CSS 解析/格式化、样式比较与应用
 *
 * 提供：
 * - parseCssText: 将 "color: red; font-size: 12px" 解析为对象
 * - formatCss: 将样式对象格式化为规范的 CSS 文本
 * - diffStyleMaps/compareStyles: 比较两个样式对象，输出差异
 * - applyStyles/applyCssText/removeStyles/getComputedStyleMap: 对元素应用/移除样式与读取计算样式
 *
 * 设计约定：
 * - 样式对象统一使用 kebab-case 属性名，例如 "font-size"
 * - 对于重复定义，后者覆盖前者
 * - 所有 API 保持无副作用（除对 DOM 应用样式的函数）
 */

export type StyleMap = Record<string, string>;

/** 将属性名转换为 kebab-case（如 backgroundColor -> background-color） */
export function toKebabCase(prop: string): string {
  if (!prop) return prop;
  return prop
    .replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())
    .replace(/^-\+/, '-')
    .replace(/^ms-/, '-ms-'); // 兼容 ms 前缀
}

/** 将属性名转换为 camelCase（如 background-color -> backgroundColor） */
export function toCamelCase(prop: string): string {
  return prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

/**
 * 解析 CSS 文本为 StyleMap
 * - 支持注释移除
 * - 支持 "prop: value !important" 形式（保留原样）
 * - 忽略空属性和值
 */
export function parseCssText(cssText: string): StyleMap {
  const map: StyleMap = {};
  if (!cssText) return map;

  // 去除注释与换行
  const cleaned = cssText
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\n|\r/g, ' ')
    .trim();

  // 分割声明
  const decls = cleaned.split(';');
  for (const decl of decls) {
    if (!decl.trim()) continue;
    const idx = decl.indexOf(':');
    if (idx === -1) continue;
    const rawProp = decl.slice(0, idx).trim();
    const value = decl.slice(idx + 1).trim();
    if (!rawProp || !value) continue;

    const prop = toKebabCase(rawProp);
    map[prop] = value;
  }
  return map;
}

/**
 * 将 StyleMap 格式化为 CSS 文本
 */
export function formatCss(
  style: StyleMap,
  options?: {
    indent?: number;
    newline?: string;
    sort?: 'asc' | 'none';
    trailingSemicolon?: boolean;
  }
): string {
  const {
    indent = 2,
    newline = '\n',
    sort = 'asc',
    trailingSemicolon = true
  } = options || {};

  const props = Object.keys(style);
  if (sort === 'asc') props.sort((a, b) => a.localeCompare(b));

  const pad = ' '.repeat(Math.max(0, indent));
  const end = trailingSemicolon ? ';' : '';
  return props
    .map((p) => `${pad}${p}: ${style[p]}${end}`)
    .join(newline)
    .trim();
}

/**
 * 比较两个样式对象
 */
export function diffStyleMaps(a: StyleMap, b: StyleMap): {
  added: StyleMap; // 仅在 b 中存在
  removed: string[]; // 仅在 a 中存在
  changed: Array<{ prop: string; from: string; to: string }>; // 两边都有但值不同
  equal: string[]; // 值相等
} {
  const added: StyleMap = {};
  const removed: string[] = [];
  const changed: Array<{ prop: string; from: string; to: string }> = [];
  const equal: string[] = [];

  const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
  for (const k of keys) {
    const ak = a?.[k];
    const bk = b?.[k];
    if (ak == null && bk != null) {
      added[k] = bk;
    } else if (ak != null && bk == null) {
      removed.push(k);
    } else if (ak != null && bk != null) {
      if (ak === bk) equal.push(k);
      else changed.push({ prop: k, from: ak, to: bk });
    }
  }
  return { added, removed, changed, equal };
}

/** compareStyles 的别名，便于语义化使用 */
export const compareStyles = diffStyleMaps;

/**
 * 获取元素的计算样式映射（可选传入关心的属性列表）
 */
export function getComputedStyleMap(
  element: Element,
  properties?: string[]
): StyleMap {
  const cs = window.getComputedStyle(element as Element);
  const out: StyleMap = {};
  if (properties?.length) {
    for (const p of properties) {
      const k = toKebabCase(p);
      out[k] = cs.getPropertyValue(k).trim();
    }
  } else {
    // 遍历所有已计算属性
    for (let i = 0; i < cs.length; i++) {
      const k = cs.item(i);
      out[k] = cs.getPropertyValue(k).trim();
    }
  }
  return out;
}

/**
 * 对元素应用样式（以 inline 方式）
 * options:
 * - important: 将所有属性附加 !important
 * - replace: 先清空现有内联样式再应用
 * - remove: 需要移除的属性列表（kebab-case）
 */
export function applyStyles(
  element: HTMLElement,
  styles: StyleMap,
  options?: {
    important?: boolean;
    replace?: boolean;
    remove?: string[];
  }
): void {
  const { important = false, replace = false, remove = [] } = options || {};
  const styleDecl = element.style;

  if (replace) {
    element.removeAttribute('style');
  }

  // 先移除指定属性
  for (const r of remove) {
    const prop = toKebabCase(r);
    try {
      styleDecl.removeProperty(prop);
    } catch {
      /* noop */
    }
  }

  // 设置属性
  for (const [propRaw, valueRaw] of Object.entries(styles || {})) {
    const prop = toKebabCase(propRaw);
    const value = String(valueRaw).trim();
    if (!value) continue;

    // 保留显式的 !important，否则根据 options.important 决定
    let priority = '';
    let finalValue = value;
    if (/\s!important$/i.test(value)) {
      priority = 'important';
      finalValue = value.replace(/\s!important$/i, '').trim();
    } else if (important) {
      priority = 'important';
    }

    try {
      styleDecl.setProperty(prop, finalValue, priority);
    } catch {
      // 回退到 camelCase 以兼容部分旧属性
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (styleDecl as any)[toCamelCase(prop)] = finalValue;
    }
  }
}

/** 解析 cssText 并应用到元素 */
export function applyCssText(
  element: HTMLElement,
  cssText: string,
  options?: Parameters<typeof applyStyles>[2]
): void {
  const map = parseCssText(cssText);
  applyStyles(element, map, options);
}

/** 从元素移除指定样式 */
export function removeStyles(element: HTMLElement, props: string[]): void {
  for (const p of props) {
    const k = toKebabCase(p);
    try {
      element.style.removeProperty(k);
    } catch {
      /* noop */
    }
  }
}

/** 合并样式对象（后者覆盖前者），会规范为 kebab-case 属性名 */
export function mergeStyles(...maps: Array<StyleMap | null | undefined>): StyleMap {
  const out: StyleMap = {};
  for (const m of maps) {
    if (!m) continue;
    for (const [k, v] of Object.entries(m)) {
      out[toKebabCase(k)] = String(v);
    }
  }
  return out;
}