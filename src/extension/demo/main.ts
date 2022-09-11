
import TestComponent from './TestComponent.vue'
const Vue = window.Vue
const SfcUtils = window.SfcUtils

/**
 * 拓展执行案例
 */
function demoAction() {
  window.context.appTitle.value = '标题被改了啊啊啊啊啊啊啊啊'
  SfcUtils.snackbar('触发拓展加载：臭死了啊啊啊')
  window.context.menu.value.mainMenu.group.push({
    id: 'extension',
    name: '拓展菜单',
    items: [
      {
        title: '我是新增的拓展菜单',
        id: 'ext-1',
        icon: 'mdi-creation',
        action(context) {
          SfcUtils.confirm('', '', {
            children: Vue.h(TestComponent)
          })
        }
      }
    ]
  })
}

// 当在咸鱼云中输入1145141919810!时触发拓展动作（彩蛋）
const triggerStr = '1145141919810!'
const keyDownHistory: string[] = []

function extEventListener(e: KeyboardEvent) {

  keyDownHistory.push(e.key)
  if (keyDownHistory.length == (triggerStr.length + 1)) {
    keyDownHistory.shift()
  }

  if (keyDownHistory.join('') == triggerStr) {
    demoAction()
    window.removeEventListener('keypress', extEventListener)
  }
}

window.addEventListener('keypress', extEventListener)

export {}