<template>
  <div>
    <LoadingMask :loading="isLoading" />
    <div v-if="authentityList.length">
      <p>授权日期：{{ StringFormatter.formatDate(item.updateAt, 'yyyy-MM-dd hh:mm:ss') }}</p>
      <p>您已授予该应用以下权限</p>
      <VSheet elevation="2">
        <VList class="mt-6">
          <AuthorityListItem v-for="authorityItem in authentityList" :key="authorityItem.code" :item="authorityItem" />
        </VList>
      </VSheet>

      <div class="mt-4 d-flex justify-end">
        <VBtn
          color="error"
          prepend-icon="mdi-delete"
          variant="outlined"
          @click="toRevoke"
        >
          撤销授权
        </VBtn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emits = defineEmits<{
  (eventName: 'revoke'): void
}>()
const props = defineProps({
  item: {
    type: Object as PropType<ThirdPartyAppAuthorization>,
    required: true
  }
})
const authentityList = ref([]) as Ref<AuthorityItem[]>
const isLoading = ref(false)

const buildinAuthorityList = [
  {
    name: '用户基本信息',
    code: 'profile',
    icon: 'mdi-account-circle',
    describe: '您的用户名、邮箱与头像'
  },
  {
    name: '网盘读取权限',
    code: 'storage_read',
    icon: 'mdi-database',
    describe: '读取您的私人网盘文件与文件列表'
  },
  {
    name: '网盘写入权限',
    code: 'storage_write',
    icon: 'mdi-database',
    describe: '对您的私人网盘文件进行写入、删除、重命名、移动操作',
    isDanger: true
  }
] as AuthorityItem[]

async function toRevoke() {
  await SfcUtils.confirm('确定要撤销授权吗？', '撤销授权')
  isLoading.value = true
  try {
    await SfcUtils.request(oauth.revoke(props.item.appId, props.item.uid))
    SfcUtils.snackbar(`已解除对 ${props.item.thirdPartyApp?.name} 的授权`)
    emits('revoke')
  } finally {
    isLoading.value = false
  }
}

onMounted(async() => {
  isLoading.value = true
  const scope = props.item.scope.split(' ').filter(e => e)
  authentityList.value = buildinAuthorityList.filter(auth => scope.includes(auth.code))
  
  isLoading.value = false
})
</script>

<script lang="ts">
import { ThirdPartyAppAuthorization } from 'sfc-common/model'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted } from 'vue'
import AuthorityListItem from '../../../../sfc-oauth/components/AuthorityListItem.vue'
import { AuthorityItem } from '@/../../sfc-oauth/model'
import LoadingMask from '../LoadingMask.vue'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import oauth from 'sfc-common/api/oauth'
import { StringFormatter } from 'sfc-common/utils'

export default defineComponent({
  name: 'ThirdPartyAppAuthDetail'
})
</script>