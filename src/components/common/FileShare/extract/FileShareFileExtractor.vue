<template>
  <v-card v-if="shareInfo">
    <template #prepend>
      <user-avatar :uid="shareInfo?.uid" :name="shareInfo?.username" />
    </template>
    <template #title>
      {{ shareInfo.username }}的分享：{{ shareInfo.name }}
    </template>
    <template #subtitle>
      过期于：{{ shareInfo ? toDate(shareInfo.expiredAt) : '永久有效' }}
    </template>
    <v-card-content>
      <div style="padding: 0 60px">
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
    </v-card-content>
  </v-card>
</template>

<script setup lang="ts">
import UserAvatar from '../../UserAvatar.vue'
import FileIcon from '../../FileIcon.vue'
const toDate = StringFormatter.toDate
const toSize = StringFormatter.toSize
const props = defineProps({
  shareInfo: {
    type: Object as PropType<ShareInfo>,
    default: undefined
  }
})

const downloadLink = computed(() => {
  if (props.shareInfo) {
    return StringUtils.appendPath(API.getDefaultPrefix(), API.resource.downloadFileByMD5(props.shareInfo?.nid, props.shareInfo?.name).url)
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

export default defineComponent({
  name: 'FileShareFileExtractor'
})
</script>