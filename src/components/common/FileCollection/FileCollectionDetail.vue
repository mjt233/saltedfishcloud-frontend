<template>
  <div>
    <!-- 顶部分类页签按钮 -->
    <sticky-container
      listen-full-path
      content-class="collection-in-stick"
      :trigger-top="24"
      @change="stickStatus = $event"
    >
      <v-tabs
        v-model="tab"
        color="primary"
        grow
        :class="{'in-stick': stickStatus}"
        background-color="background"
      >
        <v-tab value="detail">
          任务详情
        </v-tab>
        <v-tab value="file">
          接受文件
        </v-tab>
      </v-tabs>
    </sticky-container>
    <div style="padding: 24px">
      <v-window v-model="tab">
        <!-- 任务详情 -->
        <v-window-item value="detail">
          <file-collection-create-form :readonly="true" :init-value="modelValue" :uid="modelValue?.uid" />
        </v-window-item>

        <!-- 接受的文件 -->
        <v-window-item value="file">
          <file-collection-record-list :cid="modelValue?.id" />
        </v-window-item>
      </v-window>
    </div>
  </div>
</template>

<script setup lang="ts">
import FileCollectionCreateForm from './form/FileCollectionCreateForm.vue'
import StickyContainer from '../StickyContainer.vue'
import FileCollectionRecordList from './FileCollectionRecordList.vue'
const tab = ref('detail')
const stickStatus = ref(false)
const props = defineProps({
  modelValue: {
    type: Object as PropType<CollectionInfo>,
    default: undefined
  }
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted } from 'vue'
import { CollectionInfo } from '@/core/model/FileCollection'

export default defineComponent({
  name: 'FileCollectionDetail'
})
</script>

<style lang="scss">
.collection-in-stick {
  width: 100%;
}
</style>

<style lang="scss" scope>
.in-stick.v-tabs {
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  width: calc(100% - 6px);
}
</style>