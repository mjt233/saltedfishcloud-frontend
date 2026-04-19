<template>
  <div ref="thisRef">
    <LoadingMask :loading="loading" />
    <VCard>
      <div class="d-flex align-center justify-end pl-4 pr-4 pt-4">
        <VTextField
          v-model="keyword"
          placeholder="搜索用户名或邮箱"
          variant="outlined"
          density="comfortable"
          hide-details
          clearable
          style="max-width: 640px;"
          @keyup.enter="onSearch"
          @click:clear="onClear"
        >
          <template #append-inner>
            <VIcon icon="mdi-magnify" @click="onSearch" />
          </template>
        </VTextField>
      </div>
      <VTable ref="tableRef" fixed-header :height="tableHeight">
        <thead>
          <tr>
            <th style="width: 280px;z-index: 1;">
              用户名
            </th>
            <th style="width: 280px;z-index: 1;">
              email
            </th>
            <th style="width: 128px;min-width: 128px;z-index: 1;">
              角色
            </th>
            <th style="z-index: 1;">
              操作
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in requestResult.content" :key="user.id">
            <td>
              <div class="d-flex align-center">

                <UserAvatar :uid="user.id" />
                <div>{{ user.user }}</div>
              </div>
            </td>
            <td>{{ user.email || '未设置' }}</td>
            <td :class="{'text-error': user.type}">
              {{ user.type ? '管理员' : '普通用户' }}
            </td>
            <td>
              <div class="user-operate">
                <VBtn v-if="!user.type && user.user != 'admin'" @click="grant(user, true)">
                  授予管理权
                </VBtn>
                <VBtn v-else-if="user.user != 'admin'" color="error" @click="grant(user, false)">
                  撤销管理
                </VBtn>
                <VBtn @click="resetPassword(user)">
                  重置密码
                </VBtn>
              </div>
            </td>
          </tr>
        </tbody>
      </VTable>
      <CommonPagination
        v-model="curPage"
        v-model:page-size="pageSize"
        :total-count="requestResult.totalCount"
        :total-page="requestResult.totalPage"
      />
    </VCard>
  </div>
</template>

<script setup lang="ts">
const loadingManager = new LoadingManager()
const loading = loadingManager.getLoadingRef()
const curPage = ref(1)
const pageSize = ref(10)
const requestResult: Ref<CommonPageInfo<RawUser>> = ref(reactive({
  content: [],
  totalCount: 0,
  totalPage: 0
}))
const thisRef = ref()
const tableRef = ref()
const keyword = ref('')
const searchKeyword = ref('')

const onSearch = () => {
  searchKeyword.value = keyword.value
  curPage.value = 1
}

const onClear = () => {
  keyword.value = ''
  searchKeyword.value = ''
  curPage.value = 1
}

const actions = MethodInterceptor.createAsyncActionProxy({
  async loadList() {
    const pageParam = { page: curPage.value - 1, size: pageSize.value }
    if (searchKeyword.value) {
      requestResult.value = (await SfcUtils.request(API.user.search(searchKeyword.value, pageParam))).data.data
    } else {
      requestResult.value = (await SfcUtils.request(API.user.getUserList(curPage.value - 1, pageSize.value))).data.data
    }
    if (requestResult.value.totalPage < curPage.value) {
      curPage.value = requestResult.value.totalPage
    }
  },
  async grant(uid: IdType, isAdmin: boolean) {
    await SfcUtils.request(API.user.setUserType(uid, isAdmin))
    await this.loadList()
  }
}, false, loadingManager)

/**
 * 授权
 * @param isAdmin 是否设为管理
 */
const grant = async(user: RawUser, isAdmin: boolean) => {
  const msg = isAdmin ? `是否将${user.user}设为管理员？` : `是否撤销${user.user}的管理员权限？`
  await SfcUtils.confirm(msg, '操作确认')
  actions.grant(user.id, isAdmin)
}

/**
 * 重置密码
 */
const resetPassword = async(user:RawUser) => {
  const inst = SfcUtils.openComponentDialog(ChangePassowrdForm, {
    props: {
      inputOldPassword: false,
      forceChange: true,
      uid: user.id
    },
    title: `强制重置用户${user.user}的密码`,
    autoShowError: true,
    async onConfirm() {
      const form = inst.getInstAsForm()
      // 这里是早期做的非标准表单，提交方法返回值不是标准的提交结果，而是boolean，出错会直接抛异常
      const success = (await form.submit()) as any as boolean
      SfcUtils.snackbar('重置成功')
      if (success) {
        actions.loadList()
        return true
      } else {
        return false
      }
    }
  })
}
const { targetHeight: tableHeight } = useAutoComputeHeight({
  autoComputeHeight: true,
  computeTarget: () => tableRef.value?.$el as HTMLElement,
  observeTarget: () => thisRef.value as HTMLElement,
  offset: -84
})
watch(curPage, actions.loadList)
watch(pageSize, actions.loadList)
watch(searchKeyword, actions.loadList)
onMounted(actions.loadList)
</script>

<script lang="ts">
import API from 'sfc-common/api'
import { ChangePassowrdForm } from 'sfc-common/components/form'
import { CommonPageInfo, IdType, RawUser } from 'sfc-common/model'
import { LoadingManager,MethodInterceptor } from 'sfc-common/utils/'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted, reactive, watch, nextTick } from 'vue'
import CommonPagination from '../CommonPagination.vue'
import { useAutoComputeHeight } from '../FileExplorer/FileExplorerCore'

export default defineComponent({
  name: 'UserManager',
  components: { CommonPagination }
})
</script>

<style scoped lang="scss">
.user-operate {
  &>* {
    margin-right: 6px;
  }
}
</style>