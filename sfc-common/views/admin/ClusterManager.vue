<template>
  <div style="padding: 12px">
    <LoadingMask :loading="loading" />
    <div class="text-h5 text-primary">
      集群管理
    </div>
    <div class="text-h6 text-primary">
      总览
    </div>
    <div class="tip">
      <div><CommonIcon icon="mdi-server-minus" color="primary" />节点数量：{{ nodes.length }}</div>
      <div><CommonIcon icon="mdi-cpu-64-bit" color="primary" />CPU核心合计：{{ nodes.map(e => e.cpu).reduce((pre, cur) => pre + cur, 0) }}</div>
      <div><CommonIcon icon="mdi-chip" color="primary" />内存合计：{{ StringFormatter.toSize(nodes.map(e => Number(e.memory)).reduce((pre, cur) => pre + cur, 0)) }}</div>
    </div>
    <VDivider />
    <div class="text-h6 text-primary">
      节点列表
    </div>
    <div>
      <VCard v-for="item in nodes" :key="item.id" class="node-card">
        <VCardContent>
          <VTable>
            <tbody>
              <tr>
                <td style="min-width: 90px;">
                  主机名
                </td>
                <td>{{ item.host }}</td>
              </tr>
              <tr>
                <td>IP地址</td>
                <td>
                  <div v-for="(ip, idx) in item.ip.split(';').filter(e => e.length)" :key="idx">
                    <span class="break-text">{{ ip }}</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td>JVM内存</td>
                <td>{{ StringFormatter.toSize(item.memory) }}</td>
              </tr>
              <tr>
                <td>CPU核心</td>
                <td>{{ item.cpu }}</td>
              </tr>
              <tr>
                <td>临时空间</td>
                <td>{{ StringFormatter.toSize(item.tempSpace) }}</td>
              </tr>
            </tbody>
          </VTable>
        </VCardContent>
      </VCard>
    </div>
  </div>
</template>

<script setup lang="ts">
const loadingManager = new LoadingManager()
const loading = loadingManager.getLoadingRef()

const nodes = ref<ClusterNodeInfo[]>([])

const actions = MethodInterceptor.createAsyncActionProxy({
  loadData: async() => {
    const res = await SfcUtils.request(API.admin.cluster.listNodes())
    nodes.value = res.data.data
  }
}, false, loadingManager)

onMounted(() => {
  actions.loadData()
})

</script>

<script lang="ts">
import API from 'sfc-common/api'
import { CommonIcon, LoadingMask } from 'sfc-common/components'
import { ClusterNodeInfo } from 'sfc-common/model'
import { LoadingManager, MethodInterceptor, SfcUtils, StringFormatter } from 'sfc-common/utils'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted } from 'vue'

export default defineComponent({
  name: 'ClusterManager',
  components: { LoadingMask, CommonIcon }
})
</script>

<style lang="scss" scoped>
.node-card {
  min-width: 320px;
  max-width: 640px;
  width: 33.3%;
  margin: 6px;
  display: inline-block;
}

@media (max-width: 1024px) {
  .node-card {
    width: calc(50% - 12px);
  }
}

@media (max-width: 640px) {
  .node-card {
    width: calc(100% - 12px);
  }
}
</style>