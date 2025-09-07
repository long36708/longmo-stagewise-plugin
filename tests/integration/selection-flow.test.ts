// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'

// 使用相对路径导入组件，避免别名解析问题
import ElementSelector from '../../src/components/ElementSelector.vue'
import { SELECTOR_CONSTANTS } from '../../src/types/element-selector'

function createFixture() {
  const container = document.createElement('div')
  container.id = 'integration-fixture'
  container.style.cssText = 'position:relative;padding:10px;'
  const targetA = document.createElement('button')
  targetA.id = 'btn-a'
  targetA.className = 'btn btn-a'
  targetA.textContent = 'A'
  const targetB = document.createElement('button')
  targetB.id = 'btn-b'
  targetB.className = 'btn btn-b'
  targetB.textContent = 'B'
  container.appendChild(targetA)
  container.appendChild(targetB)
  document.body.appendChild(container)
  return { container, targetA, targetB }
}

function click(el: Element) {
  const evt = new MouseEvent('click', { bubbles: true, cancelable: true })
  el.dispatchEvent(evt)
}

function mouseover(el: Element) {
  const evt = new MouseEvent('mouseover', { bubbles: true, cancelable: true })
  el.dispatchEvent(evt)
}

async function flush(ms = 0) {
  await new Promise((r) => setTimeout(r, ms))
}

// 清理潜在的高亮层
function cleanupOverlay() {
  const overlay = document.getElementById('element-selector-highlight')
  overlay?.remove()
}

describe('Integration: selection flow', () => {
  let wrapper: ReturnType<typeof mount>
  let fixture: ReturnType<typeof createFixture>

  beforeEach(() => {
    // 清理持久化
    try {
      window.localStorage.removeItem(SELECTOR_CONSTANTS.STORAGE_KEY)
    } catch {
      // ignore
    }
    cleanupOverlay()
    fixture = createFixture()

    // 挂载主组件，保持默认持久化开启
    wrapper = mount(ElementSelector, {
      props: {
        autoEnable: false,
        persistSelection: true
      },
    })
  })

  afterEach(() => {
    try {
      wrapper?.unmount()
    } catch {}
    fixture.container.remove()
    cleanupOverlay()
  })

  it('完成选择流程并触发事件', async () => {
    // 通过子组件事件开启选择模式（避免依赖按钮文案）
    const controls = wrapper.findComponent({ name: 'SelectionControls' })
    if (controls.exists()) {
      controls.vm.$emit('toggle-selection')
    } else {
      // 回退：若找不到子组件，直接触发一次键盘或假设已经启用
      // 但默认 autoEnable=false，这里至少模拟一次开启事件
      wrapper.vm.$emit?.('toggle-selection')
    }

    // 模拟悬停与点击
    mouseover(fixture.targetA)
    click(fixture.targetA)
    await flush(10)

    // 验证组件向外发出的事件
    const activeEmits = wrapper.emitted('activeElementChange') || []
    const selectionEmits = wrapper.emitted('selectionChange') || []
    expect(selectionEmits.length).toBeGreaterThan(0)
    const lastSelection = selectionEmits.at(-1)?.[0] as Element[] | undefined
    expect(Array.isArray(lastSelection)).toBe(true)
    expect(lastSelection && lastSelection[0]).toBe(fixture.targetA)
    // 活动元素事件
    expect(activeEmits.length).toBeGreaterThan(0)
  })

  it('展示样式/选择信息（DOM断言）', async () => {
    const controls = wrapper.findComponent({ name: 'SelectionControls' })
    controls.exists() && controls.vm.$emit('toggle-selection')

    click(fixture.targetB)
    await flush(10)

    // HTML包含选中块或者面板关键字
    const html = wrapper.html()
    expect(html.length).toBeGreaterThan(0)
    // 宽松匹配：包含“已选择元素”或“当前元素”等文案
    expect(/已选择元素|当前元素|Selection/i.test(html)).toBe(true)
  })

  it('状态持久化：重新挂载后可恢复选择', async () => {
    const controls = wrapper.findComponent({ name: 'SelectionControls' })
    controls.exists() && controls.vm.$emit('toggle-selection')
    click(fixture.targetA)
    await flush(10)

    // 卸载、重新挂载
    wrapper.unmount()
    await flush(5)
    // 不清理 fixture，使得选择器能够通过 selector 找回元素
    wrapper = mount(ElementSelector, {
      props: {
        autoEnable: false,
        persistSelection: true
      },
    })
    // 等待引擎在构造内加载持久化状态与watch派发
    await flush(20)

    const selectionEmits = wrapper.emitted('selectionChange') || []
    // 可能在mount后立即触发一次变更（best-effort）
    expect(selectionEmits.length).toBeGreaterThan(0)

    // 也可做DOM检查（选中列表显示）
    const html = wrapper.html()
    expect(/已选择元素|Selection/i.test(html)).toBe(true)
  })
})