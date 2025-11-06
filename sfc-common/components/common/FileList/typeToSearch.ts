import { DOMUtils, MethodInterceptor, StringUtils } from 'sfc-common/utils'
import { onMounted, onUnmounted } from 'vue'


// 当前累计记录的key
let curKey = ''

// 自动超时中断清理搜索函数的timeout标识
let autoClearTimer: number | null

// 是否初始化过了事件监听，用于控制防止重复初始化
let isInit = false

// 当前聚焦的可实时搜索的根元素id
let curRootId: string | null

/**
 * 实时键盘搜索选项
 */
export interface TypeToSearchOptions {
  /**
   * 获取可实时搜索内容所在的根元素
   * @returns 根元素
   */
  focusRoot: () => HTMLElement | HTMLElement

  /**
   * 满足条件时采集到键盘事件触发搜索的回调
   * @param key 已采集的搜索关键字
   * @param repeatKey 判断搜索关键字是否为一开始就一直在重复输入的按键，如果是该参数会赋值
   */
  searchCallback: (key: string, repeatKey?: string) => void

  /**
   * 当键盘按键被按下时，判断当前能否触发搜索按键采集
   * @returns true时可采集按键并触发搜索，false时不采集按键也不触发搜索
   */
  isCanTrigger?: () => boolean
}

/**
 * 测试字符串是否全是重复的字符
 * @param str 待测试的字符串
 * @returns 全是重复字符的字符串返回true，否则返回false
 */
function testIsRepeatString(str: string) {
  if (!str || str.length == 1) {
    return false
  }

  const firstChar = str[0]
  const len = str.length
  
  for (let i = 1; i < len; i++) {
    if (str[i] !== firstChar) {
      return false
    }
  }
  
  return true
}

function getElementRootId(el: HTMLElement) {
  return el.getAttribute('type-search-root-id')
}

// 由于鼠标点击，更新当前聚焦元素
function updateCurFocusRoot(e: Event) {
  if (!(e.target instanceof HTMLElement)) {
    return
  }

  // 依次尝试从事件触发元素 和 当前系统聚焦元素中查找是否在已注册的实时搜索元素下
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

  const beforeRootId = curRootId
  if (!rootElement) {
    curRootId = null
  } else {
    curRootId = getElementRootId(rootElement) as string
  }

  // 聚焦的元素切换后，清空key
  if (curRootId != beforeRootId) {
    curKey = ''
  }
}

/**
 * 处理键盘按键被按下的事件，采集按下的搜索关键字并触发搜索回调
 * @param e 键盘事件
 */
function keyPressHandler(e: KeyboardEvent) {
  if (!curRootId || !registeredInfo[curRootId]) {
    return
  }

  const opt = registeredInfo[curRootId]
  // 判断是否有触发过滤函数，有的话则执行
  if (opt.isCanTrigger && !opt.isCanTrigger()) {
    return
  }

  // 记录key并触发搜索回调
  curKey += e.key
  opt.searchCallback(curKey, testIsRepeatString(curKey) ? curKey[0] : undefined)

  // 超过一段时间没有继续输入key时，清空当前已记录的key
  if (autoClearTimer) {
    clearTimeout(autoClearTimer)
  }
  autoClearTimer = setTimeout(() => {
    curKey = ''
    clearTimeout(autoClearTimer as number)
    autoClearTimer = null
  }, 2000) as any as number
}

function init() {
  if (isInit) {
    return
  }
  isInit = true


  // 鼠标左键或右键点击可能触发焦点切换，需要更新当前聚焦元素
  window.addEventListener('click', updateCurFocusRoot)
  window.addEventListener('contextmenu', updateCurFocusRoot)

  // 按下Tab键可能触发焦点切换，也需要更新一下当前聚焦元素
  window.addEventListener('keydown', e => {
    if(e.key == 'Tab') {
      setTimeout(() => updateCurFocusRoot(e), 100)
    }
  })

  // 键盘按键被按下，在满足条件时记录搜索的key并触发搜索回调
  window.addEventListener('keypress', keyPressHandler)
}

// 当前已注册的启用搜索的可聚焦元素信息
const registeredInfo = {} as { [rootId: string]: { root: HTMLElement, id: string} & TypeToSearchOptions }

/**
 * 在视图中输入时自动触发搜索
 */
export function useTypeToSearch(searchOption: TypeToSearchOptions) {
  // 为可聚焦元素随机生成一个id
  const tmpId = Date.now() + '_' + StringUtils.getRandomStr(6, {withNumber: true})

  onMounted(() => {
    init()

    // 将随机id绑定到DOM节点上
    const rootEl = searchOption.focusRoot instanceof HTMLElement ? searchOption.focusRoot : searchOption.focusRoot()
    rootEl.setAttribute('type-search-root-id', tmpId)

    // 注册可聚焦元素信息
    registeredInfo[tmpId] = {
      ...searchOption,
      root: rootEl,
      id: tmpId
    }

    // 新挂载的DOM随机id默认设置成当前焦点元素根id
    curRootId = tmpId
  })
  onUnmounted(() => {
    delete registeredInfo[tmpId]
  })
}