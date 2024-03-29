<template>
  <file-browser
    v-if="shareInfo?.type == 'DIR'"
    :path="path"
    :file-system-handler="handler"
    :uid="shareInfo.uid"
    read-only
    :auto-compute-height="autoComputeHeight"
    :compensate-height="compensateHeight"
    :enable-menu="['refresh', 'share-download', 'showAttr']"
    :append-menu="shareMenu"
    :tool-buttons="toolButtons"
    :top-button-min-width="'120px'"
    preview-readme
    @update:path="emits('update:path', $event)"
  />
</template>

<script setup lang="ts">
import FileBrowser from '../../FileBrowser.vue'
const props = defineProps({
  shareInfo: {
    type: Object as PropType<ShareInfo>,
    default() { return{} }
  },
  autoComputeHeight: {
    type: Boolean,
    default: true
  },
  compensateHeight: {
    type: Number,
    default: -24
  },
  path: {
    type: String,
    default: '/'
  }
})
provide('protocolParams', () => ({
  id: props.shareInfo.id,
  name: props.shareInfo.name,
  path: props.path,
  targetId: props.shareInfo.id,
  protocol: 'share',
  vid: props.shareInfo.verification,
  code: props.shareInfo.extractCode
}))

const handler = computed(() => {
  return FileSystemHandlerFactory.getShareFileSystemhandler(props.shareInfo as ShareInfo)
})

const emits = defineEmits(['update:path'])

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
            const url = ctx.getFileUrl(file)
            if (!url) {
              SfcUtils.alert('无法获取文件url')
              return
            }
            SfcUtils.openUrl(url)
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
const toolButtons: MenuGroup<FileListContext>[] = [
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
        const url = ctx.getFileUrl(file)
        if (!url) {
          SfcUtils.alert('无法获取文件url')
          return
        }
        SfcUtils.openUrl(url)
      }

      // 选择文件夹或多个文件
      if (ctx.selectFileList.length > 1 || ctx.selectFileList[0].dir) {
        wrapDownload(ctx.path, ctx.selectFileList)
      }
    }
  }
]
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, computed, provide } from 'vue'
import { ShareInfo } from 'sfc-common/api/share'
import { FileSystemHandlerFactory } from 'sfc-common/core/serivce/FileSystemHandler'
import { MenuGroup } from 'sfc-common/core/context'
import { FileInfo, FileListContext } from 'sfc-common/model'
import API from 'sfc-common/api'
import SfcUtils from 'sfc-common/utils/SfcUtils'

export default defineComponent({
  name: 'FileShareDirBrowser'
})
</script>