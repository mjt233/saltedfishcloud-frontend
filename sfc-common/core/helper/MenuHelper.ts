import { getContext, type BoxMenuContext, type MenuItem } from '..'

const MenuHelper = {
  /**
   * 将一个百宝箱菜单项添加到“更多”菜单组中
   * @param menuItem 待添加的菜单项
   */
  addMoreBoxMenu(menuItem: MenuItem<BoxMenuContext>) { 
    const moreGroup = getContext().menu.value.boxMenu.find(e => e.id == 'more')
    if (moreGroup) {
      moreGroup.items.push(menuItem)
    } else {
      getContext().menu.value.boxMenu.push({
        id: 'more',
        name: '更多',
        items: [menuItem],
      })
    }
  },
}
export {
  MenuHelper
}