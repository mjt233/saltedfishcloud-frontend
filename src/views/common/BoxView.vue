<template>
  <div style="padding: 12px">
    <grid-menu :items="items" />
  </div>
</template>

<script setup lang="ts">
import { AppContext, MenuGroup } from '@/core/context'
import GridMenu from '@/components/common/GridMenu.vue'

const items: MenuGroup<ToRefs<AppContext>>[] = [
  {
    id: 'shareAndCollection',
    name: '文件交流',
    items: [
      {
        id: 'file-collect',
        title: '文件收集',
        icon: 'mdi-package-down'
      },
      {
        id: 'file-share',
        title: '文件分享',
        icon: 'mdi-share-variant'
      },
      {
        id: '1',
        title: '测试1',
        icon: 'mdi-bell-circle'
      },
      {
        id: '2',
        title: '测试2',
        icon: 'mdi-bookmark'
      },
      {
        id: '3',
        title: '测试3',
        icon: 'mdi-cached'
      }
    ]
  }
]
</script>

<script lang="ts">
import { defineComponent, ToRefs } from 'vue'

export default defineComponent({
  name: 'BoxView'
})
</script>

<style lang="scss" scoped>

</style>