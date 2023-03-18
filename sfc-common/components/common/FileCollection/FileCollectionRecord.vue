<template>
  <v-expansion-panel>
    <v-expansion-panel-title>
      <div class="d-flex justify-space-between align-center" style="width: 100%">
        <span>{{ item?.filename }}</span>
        <span class="download-icon" @click.stop="item && downloadFile(item)"><v-icon icon="mdi-download" /></span>
      </div>
      
    </v-expansion-panel-title>
    <v-expansion-panel-text>
      <v-table>
        <tbody>
          <tr>
            <td style="width: 120px">
              MD5
            </td>
            <td><span class="break-text">{{ item?.md5 }}</span></td>
          </tr>
          <tr>
            <td>提交者</td>
            <td>{{ item?.username || '游客' }}</td>
          </tr>
          <tr>
            <td>提交IP</td>
            <td>{{ item?.ip }}</td>
          </tr>
          <tr>
            <td>提交日期</td>
            <td>{{ toDate(item?.createdAt || 0) }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>

<script setup lang="ts">
const props = defineProps({
  item: {
    type: Object as PropType<CollectionRecord>,
    default: undefined
  }
})
const toDate = StringFormatter.toDate

const downloadFile = (record: CollectionRecord) => {
  const url = StringUtils.appendPath(API.getDefaultPrefix(), API.resource.downloadFileByMD5(record.md5, record.filename).url)
  window.open(url)
}
</script>

<script lang="ts">
import API from 'sfc-common/api'
import { CollectionRecord } from 'sfc-common/model/FileCollection'
import { StringFormatter } from 'sfc-common/utils/StringFormatter'
import { StringUtils } from 'sfc-common/utils/StringUtils'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'

export default defineComponent({
  name: 'FileCollectionRecord'
})
</script>

<style lang="scss" scope>
.download-icon {
  margin: 0 32px;
  cursor: pointer;
  transition: all .2s;
  &:hover {
    color: rgb(var(--v-theme-primary));
  }
}
</style>