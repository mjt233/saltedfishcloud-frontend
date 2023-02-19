import { ComponentPublicInstance } from 'vue'
export interface TimeoutBtnModel extends ComponentPublicInstance {
  /**
   * 开始执行等待倒计时
   */
  startWait: () => void
}