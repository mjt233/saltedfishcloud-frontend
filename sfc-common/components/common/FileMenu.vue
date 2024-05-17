<template>
  <teleport to="body">
    <v-btn ref="menuAnchor" class="menu-anchor" v-bind="$attrs">
      <v-menu v-model="showMenu" activator="parent">
        <v-list
          bg-color="background"
          class="menu-list"
        >
          <template
            v-for="(menuGroup, gIndex) in availableMenu"
            :key="gIndex"
          >
            <v-list-item
              v-for="(item) in menuGroup.items"
              :key="item.id"
              class="file-menu-item"
              :value="item.id"
              @click="itemClick($event, item)"
              @mouseover="itemOver($event, item)"
            >
              <template #prepend>
                <CommonIcon
                  v-if="item.icon"
                  size="small"
                  :icon="item.icon"
                  style="margin-right: 8px"
                />
              </template>
              <v-list-item-title :style="{'marginLeft': item.icon ? '0px' : '28px'}">
                {{ item.title }}
                <template v-if="item.subItems">
                  <common-icon icon="mdi-menu-right" />
                  <file-menu
                    :ref="refInst => subItemRefMap[item.id] = refInst"
                    :menu="getSubItems(item.subItems || [])"
                    :list-context="listContext"
                    @close="curOpenSubItemRef = null"
                  />
                </template>
              </v-list-item-title>
            </v-list-item>
            <v-divider v-if="gIndex != availableMenu.length - 1 && menuGroup.items.length != 0" />
          </template>
        </v-list>
      </v-menu>
    </v-btn>
  </teleport>
</template>

<script setup lang="ts">
const propsAttr = defineProps({
  menu: {
    type: Array as PropType<MenuGroup<FileListContext>[]>,
    default: () => []
  },
  container: {
    type: [Object, String, HTMLElement],
    default: null
  },
  listContext: {
    type: Object as PropType<FileListContext>,
    default: null
  },
  loadingManager: {
    type: Object as PropType<LoadingManager>,
    default: null
  },
  topElement: {
    type: HTMLElement,
    default: document.body
  }
})

const emits = defineEmits<{
  (name: 'close'): void
}>()
const subItemRefMap = {} as {[other: string]: any}
const itemRefMap = {} as {[other: string]: any}

/**
 * 获取菜单子项数组
 * @param items 菜单子项数组 或 其生成函数
 */
const getSubItems = (items?: MenuSubItem<FileListContext>) => {
  if (items instanceof Function) {
    return items(propsAttr.listContext)
  } else {
    return items as unknown as MenuGroup<FileListContext>[]
  }
}

/**
 * 计算当前菜单可渲染的菜单项
 */
const availableMenu = computed(() => {
  const ret = propsAttr.menu
    .map(group => {
      const availableItem = group.items.filter(item => !item.renderOn || item.renderOn(propsAttr.listContext))
      const newGroup = {} as MenuGroup<FileListContext>
      Object.assign(newGroup, group)
      newGroup.items = availableItem
      return newGroup
    })
    .filter(group => (!group.renderOn || group.renderOn(propsAttr.listContext)) && group.items.length > 0 )
  return ret
})

const menuAnchor = ref()
const showMenu = ref(false)

/**
 * 打开菜单
 * @param x 菜单x轴（left）
 * @param y 菜单y轴（top）
 */
const openMenu = async(x: number, y: number) => {
  const anchor = menuAnchor.value.$el as HTMLElement
  anchor.style.left = x + 'px'
  anchor.style.top = y + 'px'
  showMenu.value = true
}

/**
 * 由于contextmenu事件触发的回调，打开当前菜单
 * @param e 鼠标事件
 */
const openMenuEventHandler = async(e: MouseEvent) => {
  e.stopPropagation()
  e.preventDefault()
  Object.values(subItemRefMap).filter(e => e).forEach(e => e.closeMenu()  )
  if (showMenu.value) {
    showMenu.value = false
    setTimeout(() => openMenu(e.pageX, e.pageY), 120)
  } else {
    openMenu(e.pageX, e.pageY)
  }
}

/**
 * 关闭当前菜单
 */
const closeMenu = () => {
  closeAllSubItem()
  showMenu.value = false
}
let el: HTMLElement

/**
 * 添加监听contextmenu事件
 */
const addListen = () => {
  el && el.addEventListener('contextmenu', openMenuEventHandler)
}

/**
 * 移除监听contextmenu事件
 */
const removeListen = ()=> {
  el && el.removeEventListener('contextmenu', openMenuEventHandler)
}

/**
 * 重新监听contextmenu事件
 */
const resetListen = () => {
  removeListen()
  if (propsAttr.container instanceof String) {
    el = document.querySelector(propsAttr.container as string) as HTMLElement
  } else if (propsAttr.container instanceof HTMLElement) {
    el = propsAttr.container
  }
  addListen()
}

/**
 * 菜单被点击处理方法
 * @param e 鼠标事件
 * @param item 菜单项对象
 */
const itemClick = async(e: MouseEvent, item: MenuItem<FileListContext>) => {
  // 没有子菜单、或者有子菜单且本身存在点击动作时，才关闭当前菜单
  if (!item.subItems || (item.subItems && item.action)) {
    closeMenu()
  }
  
  let inloading = false
  try {
    if (item.action) {
      const ret = item.action(propsAttr.listContext)
      if (ret instanceof Promise) {
        if (ret instanceof LoadingControlPromise && !ret.autoLoading) {
          return ret
        }
        propsAttr.loadingManager.beginLoading()
        inloading = true
        await ret
      }
    }
  } catch (error: any) {
    SfcUtils.snackbar(error, 1500, { outClose: true })
    console.error(error)
  } finally {
    if (inloading) {
      propsAttr.loadingManager.closeLoading()
    }
  }
}

let curOpenSubItemRef: any
/**
 * 关闭所有子菜单
 */
const closeAllSubItem = () => {
  Object.values(subItemRefMap).filter(e => e).forEach(e => e.closeMenu())
  curOpenSubItemRef = null
}

/**
 * 菜单项鼠标移动到上面的事件
 * @param e 鼠标事件
 * @param item 菜单项对象
 */
const itemOver = (e: MouseEvent, item: MenuItem<FileListContext>) => {
  const subItemRef = subItemRefMap[item.id]
  if (curOpenSubItemRef == subItemRef) {
    return
  } else if (subItemRef && curOpenSubItemRef != subItemRef) {
    closeAllSubItem()
    curOpenSubItemRef = subItemRef
    
    const activatorDOM = DOMUtils.getElParentByClass(e.target as HTMLElement, 'file-menu-item')
    const { x, y, width, height } = activatorDOM?.getBoundingClientRect() as DOMRect
    subItemRef.openMenu(x + width - 16, y)
  } else {
    closeAllSubItem()
  } 
}
watch(() => propsAttr.container, () => {
  resetListen()
})
watch(showMenu, val => {
  if (!val) {
    emits('close')
    curOpenSubItemRef = null
  }
})
onMounted(() => {
  resetListen()
})
onUnmounted(() => {
  removeListen()
})
defineExpose({
  openMenu,
  closeMenu
})
</script>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, PropType, Ref, ref, watch } from 'vue'
import { MenuGroup, MenuItem, MenuSubItem } from 'sfc-common/core/context'
import { FileListContext } from 'sfc-common/model'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { LoadingControlPromise, LoadingManager } from 'sfc-common/utils/LoadingManager'
import DOMUtils from 'sfc-common/utils/DOMUtils'

export default defineComponent({
  name: 'FileMenu'
})
</script>


<style scoped>

.menu-anchor {
  width: 0 !important;
  height: 0 !important;
  position: fixed;
}

</style>