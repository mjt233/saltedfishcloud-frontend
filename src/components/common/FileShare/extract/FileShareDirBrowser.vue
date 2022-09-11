<template>
  <file-browser
    v-if="shareInfo?.type == 'DIR'"
    v-model:path="path"
    :file-system-handler="handler"
    :uid="shareInfo.uid"
    read-only
    :auto-compute-height="autoComputeHeight"
    :compensate-height="compensateHeight"
    :enable-menu="['refresh', 'share-download']"
    :append-menu="shareMenu"
    :top-buttons="topButtons"
    :top-button-min-width="'120px'"
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
  return FileSystemHandlerFactory.getShareFileSystemhandler(props.shareInfo as ShareInfo)
})

/**
 * 执行打包下载
 * @param path 文件所在目录路径
 * @param files 文件列表
 */
const wrapDownload = async(path: string, files: FileInfo[]) => {
  const wid = (await SfcUtils.request(API.wrap.createWrap({
    filenames: files.map(e => e.name),
    path: path,
    source: 'share',
    sourceId: (props.shareInfo as ShareInfo).id,
    otherData: {
      extractCode: props.shareInfo?.extractCode,
      vid: props.shareInfo?.verification
    }
  }))).data.data

  SfcUtils.openApiUrl(API.wrap.downloadWrap(wid, props.shareInfo?.name + '_打包下载.zip'))
}

/**
 * 右键菜单
 */
const shareMenu:MenuGroup<FileListContext>[] = [
  {
    id: 'share-menu',
    name: '分享菜单',
    items: [
      {
        id: 'share-download',
        title: '下载',
        icon: 'mdi-download',
        async action(ctx) {
          if (ctx.selectFileList.length == 1) {
            const file = ctx.selectFileList[0]
            SfcUtils.openApiUrl(API.resource.downloadFileByMD5(file.md5, file.name))
          } else {
            return wrapDownload(ctx.path, ctx.selectFileList)
          }
          
        }
      }
    ]
  }
]

/**
 * 顶部按钮
 */
const topButtons: MenuGroup<FileListContext>[] = [
  {
    id: 'download',
    items: [],
    name: '下载',
    icon: 'mdi-download',
    async action(ctx: FileListContext) {
      if (ctx.selectFileList.length == 0) {
        SfcUtils.snackbar('请选择文件')
        return
      }
      // 选择单个文件
      if (ctx.selectFileList.length == 1 && !ctx.selectFileList[0].dir) {
        const file = ctx.selectFileList[0]
        SfcUtils.openApiUrl(API.resource.downloadFileByMD5(file.md5, file.name))
      }

      // 选择文件夹或多个文件
      if (ctx.selectFileList.length > 1 || ctx.selectFileList[0].dir) {
        wrapDownload(ctx.path, ctx.selectFileList)
      }
    }
  }
]
const path = ref('/')
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, computed } from 'vue'
import { ShareInfo } from '@/api/share'
import { FileSystemHandlerFactory } from '@/core/serivce/FileSystemHandler'
import { MenuGroup } from '@/core/context'
import { FileInfo, FileListContext } from '@/core/model'
import API from '@/api'
import SfcUtils from '@/utils/SfcUtils'
import { StringUtils } from '@/utils/StringUtils'

export default defineComponent({
  name: 'FileShareDirBrowser'
})
</script>