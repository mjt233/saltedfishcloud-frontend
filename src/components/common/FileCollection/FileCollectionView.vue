<template>
  <div style="padding: 6px">
    <loading-mask :loading="loading" />
    <sticky-container v-if="stickyButton" :top="stickyTop">
      <v-btn color="primary" @click="openCreate">
        <v-icon>mdi-plus</v-icon>新建收集
      </v-btn>
    </sticky-container>
    <v-btn v-else color="primary" @click="openCreate">
      <v-icon>mdi-plus</v-icon>新建收集
    </v-btn>
    <grid-container gap="12px" :width="360" style="margin-top: 16px">
      <file-collection-item
        v-for="(item, index) in collectionList"
        :key="index"
        :item="item"
        @show-detail="showDetail(item)"
        @delete="handler.deleteTask(item.id)"
        @close="handler.closeTask(item.id)"
        @reopen="handler.reopen(item.id)"
      />
    </grid-container>
  </div>
</template>

<script setup lang="ts">
import LoadingMask from '../LoadingMask.vue'
import GridContainer from '@/components/layout/GridContainer.vue'
import FileCollectionItem from './FileCollectionItem.vue'
import StickyContainer from '../StickyContainer.vue'
const props = defineProps({
  uid: {
    type: Number,
    default: 0
  },
  /**
   * 是否将顶部按钮设置为滚动粘性
   */
  stickyButton: {
    type: Boolean,
    default: true
  },
  /**
   * 顶部按钮粘性布局下距离页面顶部的高度，单位为px
   */
  stickyTop: {
    type: Number,
    default: 80
  }
})
const collectionList:Ref<CollectionInfo[]> = ref([])
const loadingManager = new LoadingManager()
const loading = loadingManager.getLoadingRef()
const actions = MethodInterceptor.createAsyncActionProxy({
  async loadList() {
    collectionList.value = (await SfcUtils.request(API.collection.getCreated())).data
  },
  async delete(cid: number) {
    await SfcUtils.request(API.collection.delete(cid))
  },
  async stop(cid: number) {
    await SfcUtils.request(API.collection.close(cid))
  },
  async close(cid: number) {
    await SfcUtils.request(API.collection.close(cid))
  },
  async reopen(cid: number) {
    await SfcUtils.request(API.collection.open(cid))
  }
}, false, loadingManager)

const handler = {
  async deleteTask(cid: number) {
    await SfcUtils.confirm('确定要删除这个收集任务吗？（文件不会删除）', '提示')
    await actions.delete(cid)
    SfcUtils.snackbar('删除成功')
    await actions.loadList()
  },


  async closeTask(cid: number) {
    await actions.close(cid)
    SfcUtils.snackbar('已停止')
    await actions.loadList()
  },

  async reopen(cid: number) {
    await actions.reopen(cid)
    SfcUtils.snackbar('已开启')
    await actions.loadList()
  }
}
actions.loadList()
const openCreate = () => {
  const dialog = SfcUtils.openComponentDialog(FileCollectionCreateForm, {
    persistent: true,
    title: '新建文件收集',
    props: {
      uid: props.uid
    },
    extraDialogOptions: {
      maxWidth: '810px'
    },
    async onConfirm() {
      const form = dialog.getComponentInstRef() as any as CommonForm
      const ret = await form.submit()
      if (ret.success) {
        SfcUtils.snackbar('创建成功')
        actions.loadList()
        return true
      } else {
        return false
      }
      
    }
  })
}

const showDetail = (item: CollectionInfo) => {
  const dialog = SfcUtils.openComponentDialog(FileCollectionDetailVue, {
    title: '收集详情',
    props: {
      modelValue: item,
      readonly: true,
      uid: props.uid
    },
    dense: true,
    extraDialogOptions: {
      maxWidth: '810px'
    },
  })
}
</script>

<script lang="ts">
import FileCollectionCreateForm from './form/FileCollectionCreateForm.vue'
import { CollectionInfo } from '@/core/model/FileCollection'
import SfcUtils from '@/utils/SfcUtils'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'
import API from '@/api'
import { MethodInterceptor } from '@/utils/MethodInterceptor'
import { LoadingManager } from '@/utils/LoadingManager'
import { CommonForm } from '@/utils/FormUtils'
import { Validators } from '@/core/helper/Validators'
import FileCollectionDetailVue from './form/FileCollectionDetail.vue'
export default defineComponent({
  name: 'FileCollectionView'
})
</script>

