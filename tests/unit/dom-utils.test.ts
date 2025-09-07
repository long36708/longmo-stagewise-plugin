import { describe, it, expect, beforeEach } from 'vitest'
import { 
  isElementInViewport, 
  getElementStyleInfo, 
  isElementInteractive,
  getSafeTextContent,
  debounce,
  throttle
} from '@/utils/dom-utils'

describe('DOM Utils', () => {
  let testElement: HTMLElement

  beforeEach(() => {
    testElement = document.createElement('div')
    testElement.id = 'test-element'
    testElement.className = 'test-class'
    testElement.textContent = 'Test content'
    document.body.appendChild(testElement)
  })

  describe('isElementInViewport', () => {
    it('should return boolean for element viewport status', () => {
      const result = isElementInViewport(testElement)
      expect(typeof result).toBe('boolean')
    })
  })

  describe('getElementStyleInfo', () => {
    it('should return element style information', () => {
      const styleInfo = getElementStyleInfo(testElement)
      
      expect(styleInfo).toHaveProperty('element')
      expect(styleInfo).toHaveProperty('tagName')
      expect(styleInfo).toHaveProperty('className')
      expect(styleInfo).toHaveProperty('id')
      expect(styleInfo).toHaveProperty('computedStyles')
      expect(styleInfo).toHaveProperty('inlineStyles')
      expect(styleInfo).toHaveProperty('boundingRect')
      
      expect(styleInfo.tagName).toBe('div')
      expect(styleInfo.className).toBe('test-class')
      expect(styleInfo.id).toBe('test-element')
    })
  })

  describe('isElementInteractive', () => {
    it('should return false for non-interactive elements', () => {
      expect(isElementInteractive(testElement)).toBe(false)
    })

    it('should return true for interactive elements', () => {
      const button = document.createElement('button')
      expect(isElementInteractive(button)).toBe(true)
      
      const link = document.createElement('a')
      expect(isElementInteractive(link)).toBe(true)
      
      const input = document.createElement('input')
      expect(isElementInteractive(input)).toBe(true)
    })
  })

  describe('getSafeTextContent', () => {
    it('should return text content safely', () => {
      expect(getSafeTextContent(testElement)).toBe('Test content')
    })

    it('should return empty string for elements without text', () => {
      const emptyElement = document.createElement('div')
      expect(getSafeTextContent(emptyElement)).toBe('')
    })
  })

  describe('debounce', () => {
    it('should debounce function calls', (done) => {
      let callCount = 0
      const debouncedFn = debounce(() => {
        callCount++
      }, 100)

      debouncedFn()
      debouncedFn()
      debouncedFn()

      setTimeout(() => {
        expect(callCount).toBe(1)
        done()
      }, 150)
    })
  })

  describe('throttle', () => {
    it('should throttle function calls', (done) => {
      let callCount = 0
      const throttledFn = throttle(() => {
        callCount++
      }, 100)

      throttledFn()
      throttledFn()
      throttledFn()

      expect(callCount).toBe(1)

      setTimeout(() => {
        throttledFn()
        expect(callCount).toBe(2)
        done()
      }, 150)
    })
  })
})