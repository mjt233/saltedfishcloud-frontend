import SnackBar from '@/components/common/SnackBar.vue'
import { dyncmount } from './DyncMount'



export interface SnackBarOptions {
  /**
   * 是否显示关闭按钮
   */
  showClose?: boolean,
  /**
   * 气泡消失回调
   */
  onClose?: Function,
  /**
   * 是否开启点击区域外关闭功能
   */
  outClose?:boolean,
}

/**
 * 
 * @param message 显示的文本
 * @param timeout 自动消失时间（默认2s，单位ms）
 * @param param2 气泡其他选项
 */
export function snackbar(message: string | any, timeout: number = 2000, { showClose, onClose, outClose }: SnackBarOptions = {}): void {
  let text = ''
  if (message instanceof String) {
    text = message as string
  } else {
    text = message.msg || message.message || message.toString()
  }
  if (timeout == null || timeout == undefined) {
    timeout = 2000
  }
  const handler = dyncmount(SnackBar, { 
    props: {
      text,
      timeout,
      showClose,
      outClose,
      onClose: () => {
        handler.unmount()
        onClose && onClose()
      }
    }
  })


}