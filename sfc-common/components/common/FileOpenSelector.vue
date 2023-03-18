<template>
  <grid-menu
    :items="items"
    :arg-provider="argProvider"
    :hide-group-name="true"
    :item-size="86"
  />
</template>

<script setup lang="ts">
import GridMenu from './GridMenu.vue'
import type { ArgumentProvider } from 'sfc-common/model/component/GridMenuModel'
const props = defineProps({
  handlers: {
    type: Array as PropType<FileOpenHandler[]>,
    default: () => []
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
const items: Ref<MenuGroup<FileOpenHandler>[]> = computed(() => {
  try {
    const ret: MenuGroup<FileOpenHandler>[] = [{
      id: 'openMethod',
      items: props.handlers.map(e => {
        return {
          id: e.id,
          title: e.title,
          icon: e.icon,
          action(handler) {
            emits('select', handler)
          }
        } as MenuItem<FileOpenHandler>
      }),
      name: '默认'
    }]
    return ret
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