/**
 * 事件工具函数：事件委托、防抖/节流复用、快捷键注册
 *
 * 功能点：
 * - 事件委托管理：onDelegate / offDelegate（基于 closest，支持 options）
 * - 快捷键处理：registerHotkey / unregisterHotkey（支持“Ctrl+Shift+K”等组合）
 * - 防抖/节流：从 dom-utils 复用，避免重复实现
 */

import { debounce, throttle } from './dom-utils';

/** 事件委托选项 */
export interface DelegateOptions {
  capture?: boolean;
  passive?: boolean;
  once?: boolean;
  /** 自动阻止默认行为 */
  preventDefault?: boolean;
  /** 自动阻止事件冒泡 */
  stopPropagation?: boolean;
}

/** 热键注册选项 */
export interface HotkeyOptions {
  /** 监听目标，默认 window */
  target?: Window | Document | HTMLElement;
  /** 是否捕获阶段监听 */
  capture?: boolean;
  /** 自动阻止默认行为 */
  preventDefault?: boolean;
  /** 自动阻止事件冒泡 */
  stopPropagation?: boolean;
  /** 事件类型，默认 keydown */
  type?: 'keydown' | 'keyup';
}

/** 内部：事件委托存储结构（按容器区分） */
type DelegatedKey = string; // eventType|selector|capture
const delegatedStore = new WeakMap<EventTarget, Map<DelegatedKey, Set<EventListener>>>();

/** 内部：热键存储结构（按目标区分） -> key -> handler -> wrappers */
type HotkeyKey = string; // type|capture|normalizedCombo
const hotkeyStore = new WeakMap<
  EventTarget,
  Map<HotkeyKey, Map<(e: KeyboardEvent) => void, Set<EventListener>>>
>();

/** 规范化修饰键与主键的名称 */
function normalizeKeyToken(token: string): string {
  const t = token.trim().toLowerCase();
  switch (t) {
    case 'control':
    case 'ctrl':
      return 'ctrl';
    case 'command':
    case 'cmd':
    case 'meta':
      return 'meta';
    case 'option':
    case 'alt':
      return 'alt';
    case 'shift':
      return 'shift';
    case 'space':
    case ' ':
      return 'space';
    case 'escape':
    case 'esc':
      return 'escape';
    case 'enter':
    case 'return':
      return 'enter';
    case 'arrowup':
    case 'up':
      return 'arrowup';
    case 'arrowdown':
    case 'down':
      return 'arrowdown';
    case 'arrowleft':
    case 'left':
      return 'arrowleft';
    case 'arrowright':
    case 'right':
      return 'arrowright';
    case 'plus':
      return '+';
    default:
      return t.length === 1 ? t : t; // 单字符小写，其它保持规范化小写
  }
}

/** 解析组合键字符串，如 "Ctrl+Shift+K" -> 规范化对象与 key 字符串 */
function parseCombo(combo: string): {
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  meta: boolean;
  key: string;
  normalized: string; // 例如 ctrl+shift+k
} {
  const parts = combo.split('+').map(normalizeKeyToken).filter(Boolean);
  let ctrl = false, shift = false, alt = false, meta = false;
  let key = '';
  for (const p of parts) {
    if (p === 'ctrl') ctrl = true;
    else if (p === 'shift') shift = true;
    else if (p === 'alt') alt = true;
    else if (p === 'meta') meta = true;
    else key = p; // 最后一个非修饰键作为主键
  }
  const normalizedKey = [ctrl ? 'ctrl' : '', shift ? 'shift' : '', alt ? 'alt' : '', meta ? 'meta' : '', key]
    .filter(Boolean)
    .join('+');
  return { ctrl, shift, alt, meta, key, normalized: normalizedKey };
}

/** 从 KeyboardEvent 生成规范化 key 标识，用于匹配组合键 */
function eventToKeyString(e: KeyboardEvent): string {
  let k = (e.key || '').toLowerCase();
  if (k === ' ') k = 'space';
  if (k === 'esc') k = 'escape';
  // 方向键规范化
  if (k === 'up') k = 'arrowup';
  if (k === 'down') k = 'arrowdown';
  if (k === 'left') k = 'arrowleft';
  if (k === 'right') k = 'arrowright';
  return [
    e.ctrlKey ? 'ctrl' : '',
    e.shiftKey ? 'shift' : '',
    e.altKey ? 'alt' : '',
    e.metaKey ? 'meta' : '',
    k
  ].filter(Boolean).join('+');
}

/** 事件委托：在 container 上监听 eventType，匹配 selector 的目标（基于 closest） */
export function onDelegate(
  container: Element | Document,
  eventType: string,
  selector: string,
  handler: (event: Event, matched: Element) => void,
  options: DelegateOptions = {}
): () => void {
  const capture = !!options.capture;
  const key: DelegatedKey = `${eventType}|${selector}|${capture}`;

  const wrapper: EventListener = (event: Event) => {
    const target = event.target as Element | null;
    const root: Node = (container as unknown as Node);
    if (!target || typeof (target as any).closest !== 'function') return;
    const matched = (target as any).closest(selector) as Element | null;
    // 确保 matched 在 container 内部
    const contains = (root as Document).contains
      ? (root as Document).contains(matched as Node)
      : (root as Element).contains
        ? (root as Element).contains(matched as Node)
        : true;
    if (matched && contains) {
      if (options.preventDefault && 'preventDefault' in event) (event as Event).preventDefault();
      if (options.stopPropagation && 'stopPropagation' in event) (event as Event).stopPropagation();
      handler(event, matched);
    }
  };

  const store = delegatedStore.get(container) ?? (delegatedStore.set(container, new Map()), delegatedStore.get(container)!);
  const set = store.get(key) ?? (store.set(key, new Set()), store.get(key)!);

  (container as EventTarget).addEventListener(eventType, wrapper, {
    capture,
    passive: options.passive,
    once: options.once
  } as AddEventListenerOptions);

  set.add(wrapper);

  // 返回取消函数
  const off = () => {
    (container as EventTarget).removeEventListener(eventType, wrapper, { capture } as EventListenerOptions);
    set.delete(wrapper);
    if (set.size === 0) store.delete(key);
  };

  return off;
}

/** 事件委托移除：按 container + eventType + selector + capture 维度移除全部已注册的委托 */
export function offDelegate(
  container: Element | Document,
  eventType: string,
  selector: string,
  options: Pick<DelegateOptions, 'capture'> = {}
): void {
  const capture = !!options.capture;
  const key: DelegatedKey = `${eventType}|${selector}|${capture}`;
  const store = delegatedStore.get(container);
  const set = store?.get(key);
  if (set && set.size) {
    for (const wrapper of Array.from(set)) {
      (container as EventTarget).removeEventListener(eventType, wrapper, { capture } as EventListenerOptions);
      set.delete(wrapper);
    }
    store!.delete(key);
  }
}

/** 注册快捷键，支持字符串或字符串数组。返回取消函数。 */
export function registerHotkey(
  combo: string | string[],
  handler: (e: KeyboardEvent) => void,
  options: HotkeyOptions = {}
): () => void {
  const target: EventTarget = options.target ?? window;
  const type = options.type ?? 'keydown';
  const capture = !!options.capture;
  const combos = Array.isArray(combo) ? combo : [combo];

  // 为每个组合键生成独立监听器
  const wrappers: Array<{ key: HotkeyKey; fn: EventListener }> = [];
  const perTarget = hotkeyStore.get(target) ?? (hotkeyStore.set(target, new Map()), hotkeyStore.get(target)!);

  for (const c of combos) {
    const parsed = parseCombo(c);
    const normalizedCombo = parsed.normalized;
    const key: HotkeyKey = `${type}|${capture}|${normalizedCombo}`;

    const listener: EventListener = (ev: Event) => {
      const e = ev as KeyboardEvent;
      if (eventToKeyString(e) === normalizedCombo) {
        if (options.preventDefault) e.preventDefault();
        if (options.stopPropagation) e.stopPropagation();
        handler(e);
      }
    };

    // 存储
    const byKey = perTarget.get(key) ?? (perTarget.set(key, new Map()), perTarget.get(key)!);
    const set = byKey.get(handler) ?? (byKey.set(handler, new Set()), byKey.get(handler)!);
    set.add(listener);

    // 绑定
    (target as EventTarget).addEventListener(type, listener, { capture } as AddEventListenerOptions);
    wrappers.push({ key, fn: listener });
  }

  // 返回取消函数
  const off = () => {
    for (const w of wrappers) {
      (target as EventTarget).removeEventListener(type, w.fn, { capture } as EventListenerOptions);
      const byKey = hotkeyStore.get(target)?.get(w.key);
      const set = byKey?.get(handler);
      if (set) {
        set.delete(w.fn);
        if (set.size === 0) {
          byKey!.delete(handler);
        }
      }
      const byKeyLeft = hotkeyStore.get(target)?.get(w.key);
      if (byKeyLeft && byKeyLeft.size === 0) {
        hotkeyStore.get(target)!.delete(w.key);
      }
    }
  };

  return off;
}

/** 注销快捷键：按组合键 + handler 精确移除（不影响其他处理器） */
export function unregisterHotkey(
  combo: string | string[],
  handler: (e: KeyboardEvent) => void,
  options: HotkeyOptions = {}
): void {
  const target: EventTarget = options.target ?? window;
  const type = options.type ?? 'keydown';
  const capture = !!options.capture;
  const combos = Array.isArray(combo) ? combo : [combo];
  const perTarget = hotkeyStore.get(target);
  if (!perTarget) return;

  for (const c of combos) {
    const normalizedCombo = parseCombo(c).normalized;
    const key: HotkeyKey = `${type}|${capture}|${normalizedCombo}`;
    const byKey = perTarget.get(key);
    const set = byKey?.get(handler);
    if (set && set.size) {
      for (const listener of Array.from(set)) {
        (target as EventTarget).removeEventListener(type, listener, { capture } as EventListenerOptions);
        set.delete(listener);
      }
      byKey!.delete(handler);
      if (byKey && byKey.size === 0) {
        perTarget.delete(key);
      }
    }
  }
}

/** 复用导出：防抖/节流 */
export { debounce, throttle };

/** 兼容原有类风格（如需要，可使用静态方法调用） */
export class EventUtils {
  static onDelegate = onDelegate;
  static offDelegate = offDelegate;
  static registerHotkey = registerHotkey;
  static unregisterHotkey = unregisterHotkey;
  static debounce = debounce;
  static throttle = throttle;
}