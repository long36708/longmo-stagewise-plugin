import { ref, computed, onMounted, onBeforeUnmount, watch, type Ref } from 'vue';
import type { ElementStyleInfo } from '@/types/element-selector';
import { extractElementStyles } from '@/core/style-extractor';
import {
  type StyleMap,
  parseCssText,
  formatCss,
  compareStyles,
  diffStyleMaps,
  applyStyles,
  applyCssText as applyCssTextToEl,
  removeStyles,
  getComputedStyleMap,
  mergeStyles
} from '@/utils/style-utils';
import { debounce } from '@/utils/dom-utils';

export interface UseElementStylesOptions {
  // 是否监听元素变化（属性变化/尺寸变化）
  observe?: boolean;
  // 监听的属性（仅在 observe=true 时生效）
  observedAttributes?: string[];
  // 仅提取指定的计算样式属性（为空提取常规集合）
  computedProperties?: string[];
  // 提取更新的防抖间隔
  debounceMs?: number;
}

export function useElementStyles(elementRef: Ref<Element | null>, options: UseElementStylesOptions = {}) {
  const {
    observe = true,
    observedAttributes = ['style', 'class', 'id'],
    computedProperties = [],
    debounceMs = 80
  } = options;

  const info = ref<ElementStyleInfo | null>(null);
  const isObserving = ref(false);
  const lastError = ref<Error | null>(null);

  // 列表视图
  const computedList = computed(() => {
    const map = info.value?.computedStyles || {};
    return Object.keys(map)
      .sort()
      .map((k) => ({ name: k, value: map[k] }));
  });

  const inlineList = computed(() => {
    const map = info.value?.inlineStyles || {};
    return Object.keys(map)
      .sort()
      .map((k) => ({ name: k, value: map[k] }));
  });

  const hasInlineStyles = computed(() => inlineList.value.length > 0);

  // 观察器
  let mutationObserver: MutationObserver | null = null;
  let resizeObserver: ResizeObserver | null = null;

  const refresh = debounce(() => {
    const el = elementRef.value;
    if (!el) {
      info.value = null;
      return;
    }
    try {
      // 透传属性列表配置以控制计算样式提取范围
      info.value = extractElementStyles(el, {
        cssProperties: computedProperties
      });
      lastError.value = null;
    } catch (e) {
      lastError.value = e as Error;
      info.value = null;
      // 保持静默，避免打断使用
      // console.warn('useElementStyles refresh failed:', e);
    }
  }, debounceMs);

  const startObserve = () => {
    const el = elementRef.value;
    if (!observe || !el || isObserving.value) return;

    // 属性/子树变化：关注 class/id/style
    mutationObserver = new MutationObserver(() => refresh());
    mutationObserver.observe(el, {
      attributes: true,
      attributeFilter: observedAttributes,
      childList: false,
      subtree: false
    });

    // 尺寸变化
    try {
      resizeObserver = new ResizeObserver(() => refresh());
      resizeObserver.observe(el as Element);
    } catch {
      // 某些环境不支持 ResizeObserver，忽略
    }

    isObserving.value = true;
  };

  const stopObserve = () => {
    mutationObserver?.disconnect();
    mutationObserver = null;
    resizeObserver?.disconnect();
    resizeObserver = null;
    isObserving.value = false;
  };

  // 监听元素切换
  watch(
    elementRef,
    () => {
      stopObserve();
      refresh();
      startObserve();
    },
    { immediate: true }
  );

  onMounted(() => {
    refresh();
    startObserve();
  });

  onBeforeUnmount(() => {
    stopObserve();
  });

  // 样式操作 API
  const setStyles = (styles: StyleMap, opts?: { important?: boolean; replace?: boolean; remove?: string[] }) => {
    const el = elementRef.value as HTMLElement | null;
    if (!el) return;
    applyStyles(el, styles, opts);
    refresh();
  };

  const applyCssText = (cssText: string, opts?: { important?: boolean; replace?: boolean; remove?: string[] }) => {
    const el = elementRef.value as HTMLElement | null;
    if (!el) return;
    applyCssTextToEl(el, cssText, opts);
    refresh();
  };

  const removeStyleProps = (props: string[]) => {
    const el = elementRef.value as HTMLElement | null;
    if (!el) return;
    removeStyles(el, props);
    refresh();
  };

  const getComputed = (props?: string[]): StyleMap => {
    const el = elementRef.value;
    if (!el) return {};
    return getComputedStyleMap(el, props && props.length ? props : computedProperties);
  };

  const diffWithComputed = (incoming: StyleMap | string) => {
    const target = typeof incoming === 'string' ? parseCssText(incoming) : incoming;
    const base = getComputed();
    return diffStyleMaps(base, target);
  };

  const diffWithInline = (incoming: StyleMap | string) => {
    const inline = info.value?.inlineStyles || {};
    const target = typeof incoming === 'string' ? parseCssText(incoming) : incoming;
    return diffStyleMaps(inline, target);
  };

  const mergeInline = (extra: StyleMap | string, opts?: { important?: boolean }) => {
    const el = elementRef.value as HTMLElement | null;
    if (!el) return;
    const base = info.value?.inlineStyles || {};
    const add = typeof extra === 'string' ? parseCssText(extra) : extra;
    const merged = mergeStyles(base, add);
    applyStyles(el, merged, { important: opts?.important });
    refresh();
  };

  return {
    // 数据
    info,
    computedList,
    inlineList,
    hasInlineStyles,
    isObserving,
    lastError,

    // 操作
    refresh,
    setStyles,
    applyCssText,
    removeStyleProps,
    getComputed,
    diffWithComputed,
    diffWithInline,
    mergeInline,

    // 工具
    parseCssText,
    formatCss,
    compareStyles
  };
}

export type UseElementStylesReturn = ReturnType<typeof useElementStyles>;