<template>
  <div v-if="shareInfo.name" style="padding: 0 60px">
    <v-row>
      <v-col>
        <div class="d-flex align-center">
          <div style="margin-right: 18px;">
            <file-icon
              style="width: 48px;height: 48px;"
              :file-name="shareInfo.name"
              :is-dir="false"
              :md5="shareInfo.nid"
            />
          </div>
          <div>
            <div>文件名：{{ shareInfo.name }}</div>
            <div class="tip">
              大小：{{ toSize(shareInfo.size) }}
            </div>
          </div>
        </div>
      </v-col>
    </v-row>
    <v-row style="margin-top: 12px">
      <v-col>
        <v-btn color="primary" style="margin-right: 12px" @click="openFile">
          <div>
            <v-icon icon="mdi-file" />
            在线打开
          </div>
        </v-btn>
        <a target="_blank" :href="downloadLink">
          <v-btn color="primary">
            <div>
              <v-icon icon="mdi-download" />
              下载
            </div>
          </v-btn>
        </a>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import FileIcon from '../../FileIcon.vue'
const toSize = StringFormatter.toSize
const props = defineProps({
  shareInfo: {
    type: Object as PropType<ShareInfo>,
    default() { return {} }
  }
})

const openFile = () => {
  // 模拟一个文件列表上下文参数，调通用的文件打开方法
  const fileInfo:FileInfo =  {
    name: props.shareInfo?.name,
    uid: props.shareInfo.uid,
    size: props.shareInfo.size,
    dir: false,
    node: props.shareInfo.parentId,
    path: '/'
  } as FileInfo

  const ctx: FileListContext = {
    getFileUrl: (file: FileInfo) => downloadLink.value,
    getThumbnailUrl: (file: FileInfo) => downloadLink.value + '&isThumbnail=true',
    fileList: [fileInfo],
    getProtocolParams: () => {
      return {
        id: props.shareInfo.id,
        name: props.shareInfo.name,
        path: '/',
        targetId: props.shareInfo.id,
        protocol: 'share',
        vid: props.shareInfo.verification,
        code: props.shareInfo.extractCode
      }
    },
    selectFileList: [],
    enableFeature: [],
    uid: props.shareInfo.uid,
    readonly: true,
    path: '/',
    modelHandler: null as any,
    protocol: 'share'
  } as FileListContext

  SfcUtils.openFile(ctx, fileInfo)
}

const downloadLink = computed(() => {
  if (props.shareInfo) {
    const url = SfcUtils.getApiUrl(API.resource.getCommonResource({
      name: props.shareInfo.name,
      path: '/',
      targetId: props.shareInfo.id,
      protocol: 'share',
      vid: props.shareInfo.verification,
      code: props.shareInfo.extractCode
    }))
    return url
    // return StringUtils.appendPath(API.getDefaultPrefix(), API.resource.downloadFileByMD5(props.shareInfo?.nid, props.shareInfo?.name).url)
  } else {
    return location.href
  }
})
</script>

<script lang="ts">
import { ShareInfo } from '@/api/share'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, computed } from 'vue'
import { StringFormatter } from '@/utils/StringFormatter'
import { StringUtils } from '@/utils/StringUtils'
import API from '@/api'
import SfcUtils from '@/utils/SfcUtils'
import { FileInfo, FileListContext } from '@/core/model'

export default defineComponent({
  name: 'FileShareFileExtractor'
})
</script>