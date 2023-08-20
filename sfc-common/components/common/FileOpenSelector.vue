<template>
  <grid-menu
    style="padding-left: 24px;"
    :items="items"
    :arg-provider="argProvider"
    :hide-group-name="handlerGroups ? false : true"
    :item-size="86"
  />
</template>

<script setup lang="ts">
import GridMenu from './GridMenu.vue'
import type { ArgumentProvider } from 'sfc-common/model/component/GridMenuModel'
const props = defineProps({
  /**
   * 可选的文件打开方式
   */
  handlers: {
    type: Array as PropType<FileOpenHandler[]>,
    default: () => []
  },
  /**
   * 多组可选的文件打开方式，优先级比handlers高
   */
  handlerGroups: {
    type: Array as PropType<{name: string, handlers: FileOpenHandler[]}[]>,
    default: undefined
  }
})
const argProvider: ArgumentProvider<FileOpenHandler> = {
  getArgument(index: number, id: IdType) {
    return props.handlers[index]
  }
}
const emits = defineEmits<{
  (event: 'select', handler: FileOpenHandler): void
}>()

const handlerToMenuItem = (handler: FileOpenHandler) => {
  return {
    id: handler.id,
    title: handler.title,
    icon: handler.icon,
    action(ctx) {
      emits('select', handler)
    }
  } as MenuItem<FileOpenHandler>
}
const items: Ref<MenuGroup<FileOpenHandler>[]> = computed(() => {
  try {
    if (props.handlerGroups) {
      return props.handlerGroups.map((group, idx) => {
        return {
          id: group.name + '_' + idx,
          items: group.handlers.map(handlerToMenuItem),
          name: group.name
        }
      })
    } else {
      return [{
        id: 'openMethod',
        items: props.handlers.map(handlerToMenuItem),
        name: '默认'
      }]
    }
  } catch (error) {
    SfcUtils.snackbar(error)
    return []
  }

})
</script>

<script lang="ts">
import { FileOpenHandler, MenuGroup, MenuItem } from 'sfc-common/core/context'
import { FileListContext, FileInfo, IdType } from 'sfc-common/model'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, computed, ComputedRef } from 'vue'
import SfcUtils from 'sfc-common/utils/SfcUtils'

export default defineComponent({
  name: 'FileOpenSelector'
})
</script>