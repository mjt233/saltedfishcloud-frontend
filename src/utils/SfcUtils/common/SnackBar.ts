import SnackBar from '@/components/Common/SnackBar.vue'
import vuetify from '@/plugins/vuetify'
import { createApp, h } from 'vue'



export interface SnackBarOptions {
  /**
   * 是否显示关闭按钮
   */
  showClose?: boolean,
  /**
   * 气泡消失回调
   */
  onClose?: Function
}

/**
 * 
 * @param text 显示的文本
 * @param timeout 自动消失时间（默认2s，单位ms）
 * @param param2 气泡其他选项
 */
export function snackbar(text: string, timeout: number = 2000, { showClose, onClose }: SnackBarOptions = {}): void {
  const tempDOM = document.createElement('div')
  document.body.appendChild(tempDOM)
  
  if (timeout == null || timeout == undefined) {
    timeout = 2000
  }

  const unmount = () => {
    tempApp.unmount()
    document.body.removeChild(tempDOM)
  }

  // 动态创建组件
  const tempApp = createApp({
    render() {
      return h(SnackBar, {
        text,
        timeout,
        showClose,
        onClose: () => {
          unmount()
          onClose && onClose()
        }
      })
    }
  })

  // 挂载
  tempApp.use(vuetify).mount(tempDOM)


}