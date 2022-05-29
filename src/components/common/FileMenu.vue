<template>
  <v-btn ref="menuAnchor" class="menu-anchor">
    <v-menu v-model="showMenu" activator="parent">
      <v-list
        ref="menuRef"
        bg-color="background"
        class="menu-list"
      >
        <template
          v-for="(menuGroup, gIndex) in menu"
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
          <v-divider v-if="gIndex != menu.length - 1" />
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
  context: {
    type: Object as PropType<FileListContext>,
    default: null
  }
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

watch(() => propsAttr.container, () => {
  resetListen()
})


const itemClick = async(item: MenuItem<FileListContext>) => {
  closeMenu()
  try {
    if (item.action) {
      await item.action(propsAttr.context)
    }
  } catch (error: any) {
    SfcUtils.snackbar(error, 1500, { outClose: true })
    console.error(error)
  }
}

onMounted(() => {
  resetListen()
})
onUnmounted(() => {
  removeListen()
})
</script>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, PropType, Ref, ref, watch } from 'vue'
import { context, MenuGroup, MenuItem } from '@/core/context'
import { FileListContext } from '@/core/model'
import SfcUtils from '@/utils/SfcUtils'
import { debug } from 'console'

export default defineComponent({
  name: 'FileMenu'
})
</script>