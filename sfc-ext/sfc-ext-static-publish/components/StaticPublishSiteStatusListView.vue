<template>
  <div>
    <LoadingMask :loading="loading" />
    <div class="view-button-groups">
      <VBtn @click="actions.loadData">
        <CommonIcon icon="mdi-refresh" /> 刷新
      </VBtn>
    </div>
    <VCard v-for="item in dataList" :key="item.nodeInfo.id" class="site-status-card">
      <VCardText>
        <VTable>
          <tr>
            <td>主机名</td>
            <td>{{ item.nodeInfo.host }}</td>
          </tr>
          <tr>
            <td>服务端口</td>
            <td>{{ item.serverPort }}</td>
          </tr>
          <tr>
            <td>状态</td>
            <td>
              <span :style="{'color': `rgb(var(--v-theme-${item.isRunning ? 'success' : 'danger'}))`}">{{ item.isRunning ? '运行中' : '已停止' }}</span>
              <template v-if="item.errorMsg">
                <CommonIcon
                  class="link"
                  color="warning"
                  icon="mdi-alert"
                  @click="SfcUtils.alert(item.errorMsg, '错误信息')"
                />
              </template>
            </td>
          </tr>
        </VTable>
      </VCardText>
    </VCard>
  </div>
</template>

<script setup lang="ts">
const SfcUtils = window.SfcUtils
const props = defineProps({})
const lm = new LoadingManager
const loading = lm.getLoadingRef()
const actions = MethodInterceptor.createAsyncActionProxy({
  async loadData() {
    const res = (await SfcUtils.request(StaticPublishApi.listStatus())).data.data
    dataList.value = res
  }
}, false, lm)

const dataList: Ref<SiteStatus[]> = ref([])

onMounted(() => actions.loadData())
</script>

<script lang="ts">
import { LoadingManager, MethodInterceptor } from 'sfc-common'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'
import { SiteStatus } from '../model'
import StaticPublishApi from '../api'
import { onMounted } from 'vue'

export default defineComponent({
  name: 'StaticPublishSiteStatusListView'
})
</script>

<style scoped lang="scss">
.site-status-card {
  width: 100%;
  max-width: 320px;
  display: inline-block;
  animation: up-in .2s;
  margin-right: 12px;
}

.view-button-groups {
  margin: 12px 0;
}
</style>