import { DOMUtils, StringUtils } from 'sfc-common/utils'
import { onMounted, onUnmounted, ref, type Ref } from 'vue'

// 当前聚焦的根元素id
const curFocusRootId = ref<string | null>(null)

// 是否初始化过了事件监听，用于控制防止重复初始化
let isInit = false

// 当前已注册的可聚焦元素信息
const registeredInfo = {} as { [rootId: string]: { root: HTMLElement; id: string; onFocusChanged?: (newId: string | null, oldId: string | null) => void } }

/**
 * 获取元素的焦点根id
 * @param el HTML元素
 * @returns 焦点根id
 */
function getElementRootId(el: HTMLElement) {
  return el.getAttribute('focus-root-id')
}

// 由于鼠标点击，更新当前聚焦元素
function updateCurFocusRoot(e: Event) {
  if (!(e.target instanceof HTMLElement)) {
    return null
  }

  // 依次尝试从事件触发元素 和 当前系统聚焦元素中查找是否在已注册的焦点元素下
  const rootElement = [e.target, document.activeElement]
    .filter(e => e != null)
    .map(dom => {
      return DOMUtils.getElParent(dom as HTMLElement, el => {
        const rootId = getElementRootId(el)
        if (rootId && registeredInfo[rootId]) {
          return true
        } else {
          return false
        }
      })
    })
    .find(e => e != null)

  const oldRootId = curFocusRootId.value
  if (!rootElement) {
    curFocusRootId.value = null
  } else {
    curFocusRootId.value = getElementRootId(rootElement) as string
  }

  // 如果焦点发生变化，通知相关的注册元素
  if (oldRootId !== curFocusRootId.value) {
    // 通知旧的焦点元素
    if (oldRootId && registeredInfo[oldRootId]?.onFocusChanged) {
      registeredInfo[oldRootId]?.onFocusChanged?.(curFocusRootId.value, oldRootId)
    }
    // 通知新的焦点元素
    if (curFocusRootId.value && registeredInfo[curFocusRootId.value]?.onFocusChanged) {
      registeredInfo[curFocusRootId.value]?.onFocusChanged?.(curFocusRootId.value, oldRootId)
    }
  }

  return { oldRootId, curRootId: curFocusRootId.value }
}

function initFocusManager() {
  if (isInit) {
    return
  }
  isInit = true

  // 鼠标左键或右键点击可能触发焦点切换，需要更新当前聚焦元素
  window.addEventListener('click', updateCurFocusRoot)
  window.addEventListener('contextmenu', updateCurFocusRoot)

  // 按下Tab键可能触发焦点切换，也需要更新一下当前聚焦元素
  window.addEventListener('keydown', e => {
    if (e.key == 'Tab') {
      setTimeout(() => updateCurFocusRoot(e), 100)
    }
  })
}

/**
 * 文档焦点管理选项
 */
export interface DocumentFocusOptions {
  /**
   * 获取可聚焦内容所在的根元素
   * @returns 根元素
   */
  focusRoot: () => HTMLElement | HTMLElement

  /**
   * 焦点变化时的回调
   * @param newFocusRootId 新的焦点元素id
   * @param oldFocusRootId 旧的焦点元素id
   */
  onFocusChanged?: (newFocusRootId: string | null, oldFocusRootId: string | null) => void
}

/**
 * 文档焦点管理
 * @param options 选项
 * @returns 焦点相关信息
 */
export function useDocumentFocus(options: DocumentFocusOptions) {
  // 为可聚焦元素随机生成一个id
  const focusRootId = Date.now() + '_' + StringUtils.getRandomStr(6, { withNumber: true })

  onMounted(() => {
    initFocusManager()

    // 将随机id绑定到DOM节点上
    const rootEl = options.focusRoot instanceof HTMLElement ? options.focusRoot : options.focusRoot()
    rootEl.setAttribute('focus-root-id', focusRootId)

    // 注册可聚焦元素信息
    registeredInfo[focusRootId] = {
      root: rootEl,
      id: focusRootId,
      onFocusChanged: options.onFocusChanged
    }

    // 新挂载的DOM随机id默认设置成当前焦点元素根id
    curFocusRootId.value = focusRootId
  })

  onUnmounted(() => {
    delete registeredInfo[focusRootId]
  })

  return {
    /** 本次注册的焦点元素的id */
    focusRootId,

    /** 页面当前聚焦的元素id */
    curFocusRootId
  }
}

/**
 * 获取当前聚焦的根元素id（响应式）
 * @returns 当前聚焦的根元素id的Ref
 */
export function getCurFocusRootId(): Ref<string | null> {
  return curFocusRootId
}
