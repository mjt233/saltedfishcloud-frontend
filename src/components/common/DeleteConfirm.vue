<template>
  <div>
    <p class="text-h6">
      确定要删除
    </p>
    <br>
    <v-divider />
    <ul class="delete-list">
      <li v-for="file in fileList" :key="file.name + file.md5">
        {{ file.name }}
      </li>
    </ul>
    <v-divider />
    <br>
    <div>共<span style="color: red">{{ fileList.length }}</span>个文件吗？（不可逆操作）</div>
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
import { FileInfo } from '@/core/model'
import { PropType } from 'vue'
import { defineComponent, defineProps } from 'vue'
import { context } from '@/core/context'

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