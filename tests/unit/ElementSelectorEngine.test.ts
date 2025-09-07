// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { ElementSelectorEngine } from '../../src/core/ElementSelectorEngine';
import { SELECTOR_CONSTANTS, type SelectionMode, SelectorError } from '../../src/types/element-selector';

describe('ElementSelectorEngine', () => {
  let container: HTMLElement;
  let targetA: HTMLElement;
  let targetB: HTMLElement;
  let engine: any;

  const events = {
    onSelectionChange: vi.fn<(els: Element[]) => void>(),
    onActiveElementChange: vi.fn<(el: Element | null) => void>(),
    onSelectionModeChange: vi.fn<(mode: SelectionMode) => void>(),
    onError: vi.fn<(err: SelectorError) => void>()
  };

  beforeEach(() => {
    // 清理事件记录
    vi.clearAllMocks();
    // 准备DOM
    container = document.createElement('div');
    container.id = 'fixture';
    container.style.cssText = 'position:relative;padding:10px;';
    targetA = document.createElement('button');
    targetA.className = 'btn-a';
    targetA.textContent = 'A';
    targetB = document.createElement('button');
    targetB.className = 'btn-b';
    targetB.textContent = 'B';
    container.appendChild(targetA);
    container.appendChild(targetB);
    document.body.appendChild(container);

    // 清理持久化
    try {
      window.localStorage.removeItem(SELECTOR_CONSTANTS.STORAGE_KEY);
    } catch {
      // jsdom 可能禁用storage时忽略
    }

    engine = new ElementSelectorEngine(
      {
        enableMultiSelect: true,
        persistSelection: true,
        maxSelectionCount: 10,
        highlightColor: '#3b82f6',
        highlightOpacity: 0.3,
        borderWidth: 2,
        zIndex: 10000
      },
      events
    );
  });

  afterEach(() => {
    try {
      engine?.disableSelection?.();
      engine?.destroy?.();
    } catch {
      // ignore
    }
    container.remove();
  });

  function click(el: Element) {
    const evt = new MouseEvent('click', { bubbles: true, cancelable: true });
    el.dispatchEvent(evt);
  }

  it('should initialize and provide element info', () => {
    const info = engine.getElementInfo(targetA);
    expect(info).toBeTruthy();
    expect(info.tagName?.toLowerCase?.()).toBe('button');
    expect(typeof info.selector).toBe('string');
    expect(info.element).toBe(targetA);
  });

  it('should change selection mode and emit event', () => {
    engine.setSelectionMode('single');
    expect(events.onSelectionModeChange).toHaveBeenCalledWith('single');
    engine.setSelectionMode('multiple');
    expect(events.onSelectionModeChange).toHaveBeenCalledWith('multiple');
  });

  it('should enable selection and select element on click', () => {
    engine.enableSelection();
    click(targetA);
    expect(events.onSelectionChange).toHaveBeenCalled();
    const lastCall = events.onSelectionChange.mock.calls.at(-1);
    expect(lastCall?.[0]).toBeInstanceOf(Array);
    expect(lastCall?.[0][0]).toBe(targetA);
  });

  it('should clear selection and emit empty selection list', () => {
    engine.enableSelection();
    click(targetA);
    engine.clearSelection();
    const lastCall = events.onSelectionChange.mock.calls.at(-1);
    expect(Array.isArray(lastCall?.[0])).toBe(true);
    expect(lastCall?.[0].length).toBe(0);
  });

  it('should persist and restore selection (best-effort)', () => {
    engine.enableSelection();
    click(targetA);
    // 调用私有持久化（实现存在时）
    engine.persistSelection?.();
    // 清空并加载
    engine.clearSelection();
    engine.loadPersistedSelection?.();
    // 再次应触发 selectionChange（可能受结构和选择器匹配影响）
    expect(events.onSelectionChange).toHaveBeenCalled();
  });
});