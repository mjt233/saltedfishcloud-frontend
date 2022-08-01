<template>
  <div>
    <loading-mask :loading="loading" />
    <v-pagination
      v-model="curPage"
      color="primary"
      size="small"
      :length="searchResult.totalPages"
      style="width: 100%;max-width: 640px;margin: 0 auto;"
    />
    <span class="tip" style="margin-left: 12px;">共{{ searchResult.total }}条结果</span>
    
    <file-list
      :file-list="searchResult.list"
      :uid="uid"
      :loading-manager="loadingManager"
      :read-only="true"
      :show-back="false"
      :use-select="false"
      @click-item="actions.clickItem"
    >
      <template #thead>
        <th>位置</th>
      </template>
      <template #tbody="{ fileInfo }">
        <td @click="emits('click-parent', fileInfo as SearchFileInfo)">
          <a class="link"> {{ (fileInfo as SearchFileInfo).parent }}</a>
        </td>
      </template>
    </file-list>
  </div>
</template>

<script setup lang="ts">
import LoadingMask from '../LoadingMask.vue'
import FileList from '../FileList/index.vue'
import type { SearchFileInfo } from '@/core/model'
const props = defineProps({
  uid: {
    type: [Number, String],
    default: 0
  },
  keywork: {
    type: String,
    default: ''
  }
})
const curPage = ref(1)
const loadingManager = new LoadingManager()
const loading = loadingManager.getLoadingRef()
const searchResult = reactive({
  total: 0,
  totalPages: 0,
  list: [] as SearchFileInfo[]
})

const emits = defineEmits<{
  (event: 'click-parent', item: SearchFileInfo): void
  (event: 'click-item', item: SearchFileInfo): void
}>()

const actions = MethodInterceptor.createAsyncActionProxy({
  async search(page: number) {
    const result = (await SfcUtils.request(API.file.search(props.uid, props.keywork, page))).data.data
    searchResult.list = result.list
    searchResult.total = result.total
    searchResult.totalPages = result.pages
  },
  clickItem(ctx: FileListContext, item: FileInfo) {
    emits('click-item', item as SearchFileInfo)
  }
}, false, loadingManager)

onMounted(() => {
  actions.search(curPage.value)
})

watch(curPage, () => {
  actions.search(curPage.value)
})
</script>

<script lang="ts">
import API from '@/api'
import { LoadingManager } from '@/utils/LoadingManager'
import { MethodInterceptor } from '@/utils/MethodInterceptor'
import SfcUtils from '@/utils/SfcUtils'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted, reactive, watch } from 'vue'
import { FileInfo, FileListContext } from '@/core/model'

export default defineComponent({
  name: 'FileSearchList'
})
</script>