<template>
  <div>
    <LoadingMask :loading="isLoading" />
    <VBtn
      color="primary"
      @click="generateNewKey"
    >
      <CommonIcon icon="add" />
      生成新密钥
    </VBtn>
    <VDataTable
      :loading="isLoading"
      loading-text="已经在拼命加载了o((>ω< ))o"
      color="primary"
      :items="keyList"
      :headers="headers"
      disable-sort
      mobile-breakpoint="md"
      hide-default-footer
      no-data-text="欸？怎么一个密钥都没有 Σ(っ °Д °;)っ"
    >
      <template #item.createAt="{ item }">
        {{ StringFormatter.formatDate(item.createAt, 'yyyy-MM-dd hh:mm:ss') }}
      </template>
      <template #item.updateAt="{ item }">
        {{ StringFormatter.formatDate(item.updateAt, 'yyyy-MM-dd hh:mm:ss') }}
      </template>
      <template #item.actions="{ item }">
        <VBtn
          variant="text"
          color="primary"
          size="small"
          @click="editKey(item)"
        >
          修改名称
        </VBtn>
        <VBtn
          variant="text"
          color="error"
          size="small"
          @click="delKey(item)"
        >
          删除
        </VBtn>
      </template>
    </VDataTable>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  appId: {
    type: [String, Number],
    required: true
  }
})
const lm = new LoadingManager()
const isLoading = lm.getLoadingRef()
const keyList = ref([] as ThirdPartyAppKeyVo[])
const actions = MethodInterceptor.createAsyncActionProxy({
  async loadKeys() {
    keyList.value = (await SfcUtils.request(API.oauth.listOAuthAppKey(props.appId))).data.data
    return keyList.value
  },
  async deleteKey(key: ThirdPartyAppKeyVo) {
    return await SfcUtils.request(API.oauth.deleteOAuthAppKey([key.id]))
  },
  async generateNewKey(name: string) {
    return (await SfcUtils.request(API.oauth.generateNewOauthAppKey(props.appId, name))).data.data
  },
  async changeKey(key: ThirdPartyAppKeyVo) {
    return await SfcUtils.request(API.oauth.changeOAuthAppKey(key))
  }
}, false, lm)

async function delKey(key: ThirdPartyAppKeyVo) {
  await SfcUtils.confirm('确定要删除该密钥吗？', '删除确认')
  await actions.deleteKey(key)
  actions.loadKeys()
  SfcUtils.snackbar('删除成功')
}

async function editKey(key: ThirdPartyAppKeyVo) {
  const newKey = {...key}
  const newName = await SfcUtils.prompt({
    title: '修改密钥名称',
    label: '请输入密钥名称',
    rules: [
      Validators.notNull(),
      Validators.maxLen('名称不能超过20个字符', 20)
    ],
    defaultValue: newKey.name
  })
  newKey.name = newName
  await actions.changeKey(newKey)
  SfcUtils.snackbar('修改成功')
  actions.loadKeys()
}

async function generateNewKey() {
  const name = await SfcUtils.prompt({
    autofocus: true,
    title: '生成密钥',
    label: '请输入密钥名称',
    rules: [
      Validators.notNull(),
      Validators.maxLen('名称不能超过20个字符', 20)
    ],
    defaultValue: 'New Key'
  })
  const newKey = await actions.generateNewKey(name)
  SfcUtils.openComponentDialog(ThirdPartyAppKeyRawInfo, {
    props: {
      keyInfo: newKey
    },
    title: '密钥信息',
    extraDialogOptions: {
      maxWidth: '420px',
      dense: true,
      confirmText: '好的，我已妥善保管密钥'
    },
    showCancel: false
  })
  await actions.loadKeys()
}

const headers = [
  { title: '名称', key: 'name', sortable: false },
  { title: 'App ID', key: 'appId', sortable: false },
  { title: 'Client Secret', key: 'clientSecret', sortable: false },
  { title: '创建时间', key: 'createAt', sortable: false },
  { title: '编辑时间', key: 'updateAt', sortable: false },
  { title: '操作', key: 'actions', sortable: false }
]
onMounted(() => {
  actions.loadKeys()
})
</script>

<script lang="ts">
import API from 'sfc-common/api'
import { ThirdPartyAppKeyVo } from 'sfc-common/model'
import { LoadingManager, MethodInterceptor, StringFormatter } from 'sfc-common/utils'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted } from 'vue'
import CommonIcon from '../CommonIcon.vue'
import { Validators } from 'sfc-common/core'
import ThirdPartyAppKeyRawInfo from './ThirdPartyAppKeyRawInfo.vue'
import { LoadingMask } from '..'

export default defineComponent({
  name: 'ThirdPartyAppKeyList'
})
</script>