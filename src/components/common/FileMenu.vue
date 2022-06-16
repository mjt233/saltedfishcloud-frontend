<template>
  <v-btn ref="menuAnchor" class="menu-anchor">
    <v-menu v-model="showMenu" activator="parent">
      <v-list
        ref="menuRef"
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
            :value="item.id"
            @click="itemClick(item)"
          >
            <v-list-item-icon
              v-if="item.icon"
              size="small"
              :icon="item.icon"
              style="margin-right: 8px"
            />
            <v-list-item-title>
              {{ item.title }}
            </v-list-item-title>
          </v-list-item>
          <v-divider v-if="gIndex != availableMenu.length - 1 && menuGroup.items.length != 0" />
        </template>
      </v-list>
    </v-menu>
  </v-btn>
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
  }
})
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
const menuRef = ref()
const showMenu = ref(false)
const openMenu = async(e: MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()
  const toOpen = () => {
    const anchor = menuAnchor.value.$el as HTMLElement
    anchor.style.top = e.clientY + 'px'
    anchor.style.left = e.clientX + 'px'
    showMenu.value = true
  }
  if (showMenu.value) {
    showMenu.value = false
    setTimeout(toOpen, 120)
  } else {
    toOpen()
  }
}
const closeMenu = () => {
  showMenu.value = false
}
let el: HTMLElement
const addListen = () => {
  el && el.addEventListener('contextmenu', openMenu)
}

const removeListen = ()=> {
  el && el.removeEventListener('contextmenu', openMenu)
}

const resetListen = () => {
  removeListen()
  if (propsAttr.container instanceof String) {
    el = document.querySelector(propsAttr.container as string) as HTMLElement
  } else if (propsAttr.container instanceof HTMLElement) {
    el = propsAttr.container
  }
  addListen()
}



const itemClick = async(item: MenuItem<FileListContext>) => {
  closeMenu()
  let inloading = false
  try {
    if (item.action) {
      const ret = item.action(propsAttr.listContext)
      if (ret instanceof Promise) {
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

watch(() => propsAttr.container, () => {
  resetListen()
})
onMounted(() => {
  resetListen()
})
onUnmounted(() => {
  removeListen()
})
</script>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, PropType, Ref, ref, watch } from 'vue'
import { context, MenuGroup, MenuItem } from '@/core/context'
import { FileListContext } from '@/core/model'
import SfcUtils from '@/utils/SfcUtils'
import { debug, group } from 'console'
import { LoadingManager } from '@/utils/LoadingManager'

export default defineComponent({
  name: 'FileMenu'
})
</script>