<template>
  <div>
    <div>共<span style="color: red">{{ fileList.length }}</span>个文件将被删除，是否确认？（不可逆操作）</div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  fileList: {
    type: Array as PropType<FileInfo[]>,
    default: () => []
  }
})
</script>

<script lang="ts">
import { FileInfo } from 'sfc-common/model'
import { PropType } from 'vue'
import { defineComponent, defineProps } from 'vue'

export default defineComponent({
  name: 'DeleteConfirm'
})
</script>

<style lang="scss" scoped>

.delete-list {
  list-style: none;
  max-height: calc(70vh - 200px);
  overflow: auto;
  &>li {
    margin: 6px 0;
  }
}

</style>