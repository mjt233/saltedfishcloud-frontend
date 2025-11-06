const DOMUtils = {
  /**
     * 计算一个父子节点之间的总offsetTop（途径节点必须position必须为非static或非默认）
     * @param {HTMLElement} childElement 子节点
     * @param {HTMLElement} parentElement 父节点
     * @return {Number}
     */
  getAbsoluteOffsetTop(childElement: HTMLElement, parentElement: HTMLElement) {
    let el = childElement
    let res = 0
    while (el !== parentElement && el !== document.body) {
      if (window.getComputedStyle(el).position !== 'static') {
        res += el.offsetTop
      }
      el = el.parentElement as HTMLElement & ParentNode
    }
    return res
  },
  /**
     * 计算一个父子节点之间的总offsetLeft（途径节点必须position必须为非static或非默认）
     * @param {HTMLElement} childElement 子节点
     * @param {HTMLElement} parentElement 父节点
     * @return {Number}
     */
  getAbsoluteOffsetLeft(childElement: HTMLElement, parentElement: HTMLElement) {
    let el = childElement
    let res = 0
    while (el !== parentElement && el !== document.body) {
      if (window.getComputedStyle(el).position !== 'static') {
        res += el.offsetLeft
      }
      el = el.parentElement as HTMLElement & ParentNode
    }
    return res
  },
  /**
   * 根据类名取某个元素的父节点，成功返回DOM，失败返回null
   * @param {HTMLElement} elem
   * @param {String} className
   * @return {HTMLElement}
   */
  getElParentByClass(elem: HTMLElement, className: string) {
    return this.getElParent(elem, el => el.classList.contains(className))
  },
  /**
   * 按自定义逻辑查找匹配的父级元素，成功返回DOM，失败返回null
   * @param elem 开始向上寻找DOM节点的起始元素
   * @param mather 查找匹配规则
   */
  getElParent(elem: HTMLElement, mather: (el: HTMLElement) => boolean) {
    let t: ParentNode & HTMLElement = elem
    while (t != null && (t.nodeName === '#text' || (!mather(t) && t.tagName !== 'HTML'))) {
      t = t.parentNode as ParentNode & HTMLElement
    }
    if (t == null || t.tagName === 'HTML') {
      return null
    } else {
      return t
    }
  },
  /**
   * 判断两个DOM元素是否存在体积碰撞
   * @param el 元素1
   * @param el2 元素2
   */
  isCollide(el: HTMLElement, el2: HTMLElement): boolean {
    const rect1 = el.getBoundingClientRect()
    const rect2 = el2.getBoundingClientRect()
    const maxX: number = Math.max(rect1.x + rect1.width, rect2.x + rect2.width)
    const maxY: number = Math.max(rect1.y + rect1.height, rect2.y + rect2.height)
    const minX: number = Math.min(rect1.x, rect2.x)
    const minY: number = Math.min(rect1.y, rect2.y)
    if (maxX - minX <= rect1.width + rect2.width && maxY - minY <= rect1.height + rect2.height) {
      return true
    } else {
      return false
    }
  }
}
export default DOMUtils
