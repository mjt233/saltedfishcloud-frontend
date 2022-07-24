<template>
  <div>
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
        <v-window-item value="detail">
          <file-collection-create-form :readonly="true" :init-value="modelValue" :uid="modelValue?.uid" />
        </v-window-item>
        <v-window-item value="file">
          <div v-for="(item,index) in records" :key="index">
            {{ item.filename }}
          </div>
        </v-window-item>
      </v-window>
    </div>
  </div>
</template>

<script setup lang="ts">
import FileCollectionCreateForm from './FileCollectionCreateForm.vue'
import StickyContainer from '../../StickyContainer.vue'
const tab = ref('detail')
const stickStatus = ref(false)
const props = defineProps({
  modelValue: {
    type: Object as PropType<CollectionInfo>,
    default: undefined
  }
})

const records = ref([]) as Ref<CollectionRecord[]>
const loadList = async() => {
  const list = (await SfcUtils.request(
    API.collection.getRecords(props.modelValue?.id || context.session.value.user.id, 1, 500)
  )).data

  records.value = list.data.content
}

onMounted(() => {
  loadList()
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted } from 'vue'
import { CollectionInfo, CollectionRecord } from '@/core/model/FileCollection'
import API from '@/api'
import SfcUtils from '@/utils/SfcUtils'
import { context } from '@/core/context'

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