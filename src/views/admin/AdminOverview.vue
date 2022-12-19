<template>
  <div>
    <LoadingMask :loading="loading" />
    <EmptyTip v-if="!overviewData" text="加载中" />
    <div v-else>
      <VContainer fluid>
        <div class="text-h5 text-primary">
          文件系统信息
        </div>
        <v-row>
          <v-col
            v-for="status in overviewData.fileSystemStatus"
            :key="status.area"
            sm="12"
            md="6"
          >
            <VTable>
              <tbody>
                <tr>
                  <td style="min-width: 128px">
                    存储域
                  </td>
                  <td style="min-width: 128px">
                    {{ status.area == 'public' ? '公共网盘' : '私人网盘' }}
                  </td>
                </tr>
                <tr>
                  <td>资源路径</td>
                  <td class="break-text">
                    {{ status.path || '-' }}
                  </td>
                </tr>
                <tr>
                  <td>总容量</td>
                  <td>{{ status.total ? StringFormatter.toSize(status.total) : '-' }}</td>
                </tr>
                <tr>
                  <td>已用空间</td>
                  <td>{{ status.used ? StringFormatter.toSize(status.used) : '-' }}</td>
                </tr>
                <tr>
                  <td>剩余空间</td>
                  <td>{{ status.free ? StringFormatter.toSize(status.free) + ` (${(Number(status.free)/Number(status.total)*100).toFixed(2)}%)` : '-' }}</td>
                </tr>
                <tr>
                  <td>网盘占用</td>
                  <td>{{ status.sysUsed ? StringFormatter.toSize(status.sysUsed) : '-' }}</td>
                </tr>
              </tbody>
            </VTable>
          </v-col>
        </v-row>
        <div class="text-h5 text-primary">
          其他信息
        </div>
        <v-row>
          <v-col
            v-for="statusGroup in overviewData.systemStatus"
            :key="statusGroup.name"
            sm="12"
            md="6"
            class="overview-item"
          >
            <div class="text-h6 text-primary">
              {{ statusGroup.title || statusGroup.name }}
            </div>
            <VTable>
              <tbody>
                <tr v-for="item in statusGroup.nodes" :key="item.name">
                  <td style="min-width: 120px">
                    {{ item.title }}
                  </td>
                  <td class="break-text" style="min-width: 210px">
                    <template v-if="!item.inputType || item.inputType == 'text'">
                      {{ item.value }}
                    </template>
                    <template v-else>
                      <component :is="item.inputType" :value="item.value" />
                    </template>
                    
                  </td>
                </tr>
              </tbody>
            </VTable>
          </v-col>
        </v-row>
      </VContainer>
    </div>
  </div>
</template>

<script setup lang="ts">
const loadingManager = new LoadingManager()
const loading = loadingManager.getLoadingRef()

const overviewData = ref<SystemOverview>()

const actions = MethodInterceptor.createAsyncActionProxy({
  async loadData() {
    const res = await SfcUtils.request(API.admin.sys.getOverviewInfo())
    overviewData.value = res.data.data
  }
}, false, loadingManager)

onMounted(() => {
  actions.loadData()
})
</script>

<script lang="ts">
import API from '@/api'
import type { ConfigNodeModel, NameValueType, SystemOverview } from '@/core/model'
import { LoadingManager } from '@/utils/LoadingManager'
import { MethodInterceptor } from '@/utils/MethodInterceptor'
import SfcUtils from '@/utils/SfcUtils'
import { StringFormatter } from '@/utils/StringFormatter'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, reactive, onMounted } from 'vue'

export default defineComponent({
  name: 'AdminOverview'
})
</script>

<style scoped >
.overview-item {
  display: inline-block;
  min-width: 320px;
}

</style>