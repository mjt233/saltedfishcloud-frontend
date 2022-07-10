import { MenuItem } from '@/core/context/menu/type.d'
/**
 * 菜单项点击动作时，调用action执行时传入的参数提供者
 */
export interface ArgumentProvider<T> {
  /**
   * 获取需要传入action的参数
   * @param index 被点击项的索引
   * @param item 被点击项对象
   */
  getArgument: (index: number, item: MenuItem<T>) => T
}