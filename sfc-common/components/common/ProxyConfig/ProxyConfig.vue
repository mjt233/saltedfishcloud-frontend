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
            <div class="d-flex">
              <CommonIcon
                icon="mdi-pencil"
                color="primary"
                class="link"
                @click="openProxyForm(item)"
              />
              <CommonIcon
                icon="mdi-delete-forever"
                style="--main-color: var(--v-theme-error)"
                class="link"
                @click="deleteProxy(item.name)"
              />
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
    extraDialogOptions: {
      width: '420px !important'
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
import API from 'sfc-common/api'
import { ProxyInfo } from 'sfc-common/model'
import { CommonForm } from 'sfc-common/utils/FormUtils'
import { LoadingManager } from 'sfc-common/utils/LoadingManager'
import { MethodInterceptor } from 'sfc-common/utils/MethodInterceptor'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, h } from 'vue'
import ProxyConfigFormVue from './ProxyConfigForm.vue'
import { CommonIcon } from '..'

export default defineComponent({
  name: 'ProxyConfig'
})
</script>
