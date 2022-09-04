<template>
  <div>
    <loading-mask :loading="loading" />
    <v-btn color="primary" style="margin: 6px 0" @click="openProxyForm(undefined)">
      <v-icon>mdi-plus</v-icon>
      新增节点
    </v-btn>
    <v-table>
      <thead>
        <tr>
          <th style="min-width:120px;">
            名称
          </th>
          <th style="width: 64px">
            协议
          </th>
          <th>地址</th>
          <th style="width: 64px">
            端口
          </th>
          <th>
            操作
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in proxyList" :key="item.name">
          <td>{{ item.name }}</td>
          <td>{{ item.type }}</td>
          <td>{{ item.address }}</td>
          <td>{{ item.port }}</td>
          <td>
            <div class="handle-btn-group">
              <v-icon color="primary" class="link" @click="openProxyForm(item)">
                mdi-pencil
              </v-icon>
              <v-icon
                class="link"
                style="--main-color: var(--v-theme-error)"
                @click="deleteProxy(item.name)"
              >
                mdi-delete-forever
              </v-icon>
            </div>
          </td>
        </tr>
      </tbody>
    </v-table>
    <empty-tip v-if="proxyList.length == 0" />
  </div>
</template>

<script setup lang="ts">
import EmptyTip from '../EmptyTip.vue'
const loadingManager = new LoadingManager()
const loading = loadingManager.getLoadingRef()
const proxyList: Ref<ProxyInfo[]> = ref([])
const actions = MethodInterceptor.createAsyncActionProxy({
  async loadList() {
    const list = (await SfcUtils.request(API.admin.proxy.getAllProxy())).data.data
    proxyList.value = list
  },
  deleteOne(name: string) {
    return SfcUtils.request(API.admin.proxy.deleteProxy(name))
  }
}, true, loadingManager)

const deleteProxy = async(name: string) => {
  await SfcUtils.confirm('确定要删除这个代理节点吗？', '删除确认')
  await actions.deleteOne(name)
  SfcUtils.snackbar('删除成功')
  await actions.loadList()
}

const openProxyForm = (val?: ProxyInfo) => {
  const isEdit = val
  const formInst = SfcUtils.openComponentDialog(ProxyConfigFormVue, {
    title: isEdit ? '修改代理节点' : '新增代理节点',
    props: {
      initValue: val
    },
    async onConfirm() {
      const form = formInst.getComponentInstRef() as any as CommonForm
      const res = await form.submit()
      if (!res.success) {
        return false
      } else {
        actions.loadList()
        SfcUtils.snackbar(isEdit ? '修改成功' : '创建成功')
        return true
      }
    }
  })
}

actions.loadList()
</script>

<script lang="ts">
import API from '@/api'
import { ProxyInfo } from '@/core/model'
import { CommonForm } from '@/utils/FormUtils'
import { LoadingManager } from '@/utils/LoadingManager'
import { MethodInterceptor } from '@/utils/MethodInterceptor'
import SfcUtils from '@/utils/SfcUtils'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, h } from 'vue'
import ProxyConfigFormVue from './ProxyConfigForm.vue'

export default defineComponent({
  name: 'ProxyConfig'
})
</script>
