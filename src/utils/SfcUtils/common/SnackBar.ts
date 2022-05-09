import SnackBar from '@/components/Common/SnackBar.vue'
import { dyncmount } from './DyncMount'



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
  if (timeout == null || timeout == undefined) {
    timeout = 2000
  }
  const handler = dyncmount(SnackBar, {
    text,
    timeout,
    showClose,
    onClose: () => {
      handler.unmount()
      onClose && onClose()
    }
  })


}