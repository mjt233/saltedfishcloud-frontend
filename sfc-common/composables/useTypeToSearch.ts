import { onMounted, onUnmounted } from 'vue'
import { getCurFocusRootId, useDocumentFocus } from './useDocumentFocus'

// 当前累计记录的key
let curKey = ''

// 自动超时中断清理搜索函数的timeout标识
let autoClearTimer: number | null

// 是否初始化过了事件监听，用于控制防止重复初始化
let isInit = false

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

function defaultTriggerChecker() {
  if (document.activeElement instanceof HTMLInputElement && (document.activeElement.type == '' || document.activeElement.type == 'text')) {
    return false
  } else {
    return true
  }
}

// 当前已注册的启用搜索的可聚焦元素信息（用于存储搜索相关配置）
const searchRegisteredInfo = {} as { [rootId: string]: TypeToSearchOptions }

/**
 * 处理键盘按键被按下的事件，采集按下的搜索关键字并触发搜索回调
 * @param e 键盘事件
 */
function keyPressHandler(e: KeyboardEvent) {
  const curRootId = getCurFocusRootId().value
  if (!curRootId || !searchRegisteredInfo[curRootId]) {
    return
  }

  const opt = searchRegisteredInfo[curRootId]
  const triggerChecker = opt.isCanTrigger || defaultTriggerChecker
  // 判断是否有触发过滤函数，有的话则执行
  if (!triggerChecker()) {
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

  // 键盘按键被按下，在满足条件时记录搜索的key并触发搜索回调
  window.addEventListener('keypress', keyPressHandler)
}

/**
 * 在视图中输入时自动触发搜索
 */
export function useTypeToSearch(searchOption: TypeToSearchOptions) {
  // 使用useDocumentFocus来管理焦点，当焦点变化时清空curKey
  const { focusRootId } = useDocumentFocus({
    focusRoot: searchOption.focusRoot,
    onFocusChanged: () => {
      curKey = ''
    }
  })

  onMounted(() => {
    init()
    // 注册搜索配置信息
    searchRegisteredInfo[focusRootId] = searchOption
  })

  onUnmounted(() => {
    delete searchRegisteredInfo[focusRootId]
  })
}
