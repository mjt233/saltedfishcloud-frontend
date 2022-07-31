<template>
  <file-browser
    v-if="shareInfo?.type == 'DIR'"
    v-model:path="path"
    :file-system-handler="handler"
    :uid="shareInfo.uid"
    read-only
    :auto-compute-height="autoComputeHeight"
    :compensate-height="compensateHeight"
    :enable-menu="['refresh', 'share-wrap']"
    :append-menu="shareMenu"
  />
</template>

<script setup lang="ts">
import FileBrowser from '../../FileBrowser.vue'
const props = defineProps({
  shareInfo: {
    type: Object as PropType<ShareInfo>,
    default: undefined
  },
  autoComputeHeight: {
    type: Boolean,
    default: true
  },
  compensateHeight: {
    type: Number,
    default: -24
  }
})

const handler = computed(() => {
  console.log(props.shareInfo)
  return FileSystemHandlerFactory.getShareFileSystemhandler(props.shareInfo as ShareInfo)
})

const shareMenu:MenuGroup<FileListContext>[] = [
  {
    id: 'share-menu',
    name: '分享菜单',
    items: [
      {
        id: 'share-wrap',
        title: '打包下载',
        icon: 'mdi-download',
        renderOn(ctx) {
          return ctx.selectFileList.length > 1 || ctx.selectFileList.findIndex(e => e.dir) != -1
        },
        async action(ctx) {
          if (props.shareInfo) {
            const conf = API.wrap.createWrap({
              filenames: ctx.selectFileList.map(e => e.name),
              path: ctx.path,
              source: 'share',
              sourceId: props.shareInfo.id,
              otherData: {
                extractCode: props.shareInfo.extractCode,
                vid: props.shareInfo.verification
              }
            })
            const ret = await SfcUtils.request(conf)
            const wid = ret.data.data
            const url = StringUtils.appendPath(API.getDefaultPrefix(), API.wrap.downloadWrap(wid, (ctx.path.split('/').pop() || props.shareInfo.name) + '_打包下载.zip' ).url)
            SfcUtils.openUrl(url)
          }
        }
      }
    ]
  }
]

const path = ref('/')
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, computed } from 'vue'
import { ShareInfo } from '@/api/share'
import { FileSystemHandlerFactory } from '@/core/serivce/FileSystemHandler'
import { MenuGroup } from '@/core/context'
import { FileListContext } from '@/core/model'
import API from '@/api'
import SfcUtils from '@/utils/SfcUtils'
import { StringUtils } from '@/utils/StringUtils'

export default defineComponent({
  name: 'FileShareDirBrowser'
})
</script>