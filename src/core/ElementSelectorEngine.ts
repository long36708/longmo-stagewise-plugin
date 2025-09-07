/**
 * 核心选择器引擎
 */

import {
  ElementSelectionState,
  SelectorConfig,
  SelectorEvents,
  SelectorActions,
  SelectionMode,
  SelectorError,
  SELECTOR_CONSTANTS
} from '@/types/element-selector';
import {
  getElementStyleInfo,
  debounce,
  throttle
} from '@/utils/dom-utils';
import { SelectionPersistenceManager } from './selection-persistence';

export class ElementSelectorEngine implements SelectorActions {
  private state: ElementSelectionState;
  private config: SelectorConfig;
  private events: Partial<SelectorEvents>;
  private highlightOverlay: HTMLElement | null = null;
  private mutationObserver: MutationObserver | null = null;
  private boundEventHandlers: Map<string, EventListener> = new Map();

  constructor(
    config: Partial<SelectorConfig> = {},
    events: Partial<SelectorEvents> = {}
  ) {
    this.config = {
      highlightColor: SELECTOR_CONSTANTS.DEFAULT_HIGHLIGHT_COLOR,
      highlightOpacity: SELECTOR_CONSTANTS.DEFAULT_HIGHLIGHT_OPACITY,
      borderWidth: SELECTOR_CONSTANTS.DEFAULT_BORDER_WIDTH,
      zIndex: SELECTOR_CONSTANTS.DEFAULT_Z_INDEX,
      enableMultiSelect: true,
      persistSelection: true,
      maxSelectionCount: SELECTOR_CONSTANTS.DEFAULT_MAX_SELECTION_COUNT,
      ...config
    };

    this.events = events;

    this.state = {
      selectedElements: [],
      activeElement: null,
      isSelectionEnabled: false,
      selectionMode: this.config.enableMultiSelect ? 'multiple' : 'single'
    };

    this.initializeEngine();
  }

  private initializeEngine(): void {
    try {
      this.createHighlightOverlay();
      this.setupMutationObserver();
      this.loadPersistedSelection();
    } catch (error) {
      this.handleError(new SelectorError(
        `Failed to initialize selector engine: ${error}`,
        'INITIALIZATION_ERROR'
      ));
    }
  }

  private createHighlightOverlay(): void {
    this.highlightOverlay = document.createElement('div');
    this.highlightOverlay.id = 'element-selector-highlight';
    this.highlightOverlay.style.cssText = `
      position: absolute;
      pointer-events: none;
      border: ${this.config.borderWidth}px solid ${this.config.highlightColor};
      background-color: ${this.config.highlightColor};
      opacity: ${this.config.highlightOpacity};
      z-index: ${this.config.zIndex};
      display: none;
      box-sizing: border-box;
    `;
    document.body.appendChild(this.highlightOverlay);
  }

  private setupMutationObserver(): void {
    this.mutationObserver = new MutationObserver(
      debounce((mutations) => {
        this.handleDOMChanges(mutations);
      }, 100)
    );

    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'id', 'style']
    });
  }

  private handleDOMChanges(mutations: MutationRecord[]): void {
    let needsUpdate = false;

    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        mutation.removedNodes.forEach(node => {
          if (node instanceof Element && this.state.selectedElements.includes(node)) {
            this.removeFromSelection(node);
            needsUpdate = true;
          }
        });
      }
    });

    if (needsUpdate) {
      this.notifySelectionChange();
    }
  }

  private loadPersistedSelection(): void {
    if (!this.config.persistSelection) return;

    try {
      const savedSelections = SelectionPersistenceManager.loadState();
      if (savedSelections && savedSelections.length > 0) {
        let loadedCount = 0;
        
        savedSelections.forEach(selection => {
          if (selection.selector) {
            const element = document.querySelector(selection.selector);
            if (element) {
              this.addToSelection(element);
              loadedCount++;
            }
          }
        });

        if (loadedCount > 0) {
          this.state.activeElement = this.state.selectedElements[0];
          this.state.isSelectionEnabled = true;
          this.notifySelectionChange();
          this.events.onActiveElementChange?.(this.state.activeElement);
          this.events.onSelectionModeChange?.(this.state.selectionMode);
        }
      }
    } catch (error) {
      console.warn('Failed to load persisted selection:', error);
    }
  }

  private persistSelection(): void {
    if (!this.config.persistSelection) return;

    try {
      // 生成完整的样式信息，符合 ElementStyleInfo 类型要求
      const elementsToSave = this.state.selectedElements.map(el => this.getElementInfo(el));
      SelectionPersistenceManager.saveState(elementsToSave);
    } catch (error) {
      console.warn('Failed to persist selection:', error);
    }
  }



  public enableSelection(): void {
    if (this.state.isSelectionEnabled) return;

    try {
      this.state.isSelectionEnabled = true;
      this.attachEventListeners();
      this.events.onSelectionModeChange?.(this.state.selectionMode);
    } catch (error) {
      this.handleError(new SelectorError(
        `Failed to enable selection: ${error}`,
        'ENABLE_ERROR'
      ));
    }
  }

  public disableSelection(): void {
    if (!this.state.isSelectionEnabled) return;

    try {
      this.state.isSelectionEnabled = false;
      this.detachEventListeners();
      this.hideHighlight();
      this.state.activeElement = null;
      this.events.onActiveElementChange?.(null);
    } catch (error) {
      this.handleError(new SelectorError(
        `Failed to disable selection: ${error}`,
        'DISABLE_ERROR'
      ));
    }
  }

  public toggleSelection(): void {
    if (this.state.isSelectionEnabled) {
      this.disableSelection();
    } else {
      this.enableSelection();
    }
  }

  public clearSelection(): void {
    this.state.selectedElements = [];
    this.state.activeElement = null;
    this.hideHighlight();
    this.persistSelection();
    this.notifySelectionChange();
    this.events.onActiveElementChange?.(null);
  }

  public setSelectionMode(mode: SelectionMode): void {
    if (this.state.selectionMode === mode) return;

    this.state.selectionMode = mode;
    
    if (mode === 'single' && this.state.selectedElements.length > 1) {
      this.state.selectedElements = this.state.selectedElements.slice(0, 1);
      this.persistSelection();
      this.notifySelectionChange();
    }
    
    this.events.onSelectionModeChange?.(mode);
  }

  public getSelectedElements(): Element[] {
    return [...this.state.selectedElements];
  }

  public getActiveElement(): Element | null {
    return this.state.activeElement;
  }

  public getElementInfo(element: Element) {
    return getElementStyleInfo(element);
  }

  private attachEventListeners(): void {
    const mouseOverHandler = throttle(this.handleMouseOver.bind(this), 16);
    const mouseOutHandler = this.handleMouseOut.bind(this);
    const clickHandler = this.handleClick.bind(this);
    const keyDownHandler = this.handleKeyDown.bind(this);

    document.addEventListener('mouseover', mouseOverHandler, true);
    document.addEventListener('mouseout', mouseOutHandler, true);
    document.addEventListener('click', clickHandler, true);
    document.addEventListener('keydown', keyDownHandler, true);

    this.boundEventHandlers.set('mouseover', mouseOverHandler);
    this.boundEventHandlers.set('mouseout', mouseOutHandler);
    this.boundEventHandlers.set('click', clickHandler);
    this.boundEventHandlers.set('keydown', keyDownHandler);
  }

  private detachEventListeners(): void {
    this.boundEventHandlers.forEach((handler, event) => {
      document.removeEventListener(event, handler, true);
    });
    this.boundEventHandlers.clear();
  }

  private handleMouseOver(event: Event): void {
    if (!this.state.isSelectionEnabled) return;

    const target = event.target as Element;
    if (!target || target === this.highlightOverlay) return;

    try {
      this.state.activeElement = target;
      this.showHighlight(target);
      this.events.onActiveElementChange?.(target);
    } catch (error) {
      this.handleError(new SelectorError(
        `Failed to handle mouseover: ${error}`,
        'MOUSEOVER_ERROR',
        target
      ));
    }
  }

  private handleMouseOut(): void {
    if (!this.state.isSelectionEnabled) return;
    // 保持高亮显示，直到鼠标移动到新元素
  }

  private handleClick(event: Event): void {
    if (!this.state.isSelectionEnabled) return;

    event.preventDefault();
    event.stopPropagation();

    const target = event.target as Element;
    if (!target || target === this.highlightOverlay) return;

    try {
      this.selectElement(target);
    } catch (error) {
      this.handleError(new SelectorError(
        `Failed to handle click: ${error}`,
        'CLICK_ERROR',
        target
      ));
    }
  }

  private handleKeyDown(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (!this.state.isSelectionEnabled) return;

    switch (keyboardEvent.key) {
      case 'Escape':
        this.disableSelection();
        break;
      case 'Delete':
      case 'Backspace':
        this.clearSelection();
        break;
      case 'Tab':
        keyboardEvent.preventDefault();
        this.setSelectionMode(
          this.state.selectionMode === 'single' ? 'multiple' : 'single'
        );
        break;
    }
  }

  private selectElement(element: Element): void {
    const isAlreadySelected = this.state.selectedElements.includes(element);

    if (isAlreadySelected) {
      this.removeFromSelection(element);
    } else {
      this.addToSelection(element);
    }

    this.persistSelection();
    this.notifySelectionChange();
  }

  private addToSelection(element: Element): void {
    if (this.state.selectionMode === 'single') {
      this.state.selectedElements = [element];
    } else {
      if (this.state.selectedElements.length >= this.config.maxSelectionCount) {
        this.state.selectedElements.shift(); // 移除最旧的选择
      }
      this.state.selectedElements.push(element);
    }
  }

  private removeFromSelection(element: Element): void {
    const index = this.state.selectedElements.indexOf(element);
    if (index > -1) {
      this.state.selectedElements.splice(index, 1);
    }
  }

  private showHighlight(element: Element): void {
    if (!this.highlightOverlay) return;

    try {
      const rect = element.getBoundingClientRect();
      const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;

      this.highlightOverlay.style.cssText += `
        display: block;
        left: ${rect.left + scrollX - this.config.borderWidth}px;
        top: ${rect.top + scrollY - this.config.borderWidth}px;
        width: ${rect.width}px;
        height: ${rect.height}px;
      `;
    } catch (error) {
      console.warn('Failed to show highlight:', error);
    }
  }

  private hideHighlight(): void {
    if (this.highlightOverlay) {
      this.highlightOverlay.style.display = 'none';
    }
  }

  private notifySelectionChange(): void {
    this.events.onSelectionChange?.(this.getSelectedElements());
  }

  private handleError(error: SelectorError): void {
    console.error('SelectorEngine Error:', error);
    this.events.onError?.(error);
  }

  public destroy(): void {
    try {
      this.disableSelection();
      this.mutationObserver?.disconnect();
      this.highlightOverlay?.remove();
      this.boundEventHandlers.clear();
    } catch (error) {
      console.error('Failed to destroy selector engine:', error);
    }
  }
}