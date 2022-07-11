/**
 * 菜单项点击动作时，调用action执行时传入的参数提供者
 */
export interface ArgumentProvider<T> {
  /**
   * 获取需要传入action的参数
   * @param index 被点击项的索引
   * @param id 被点击项对象id
   */
  getArgument: (index: number, id: string | number) => T
}