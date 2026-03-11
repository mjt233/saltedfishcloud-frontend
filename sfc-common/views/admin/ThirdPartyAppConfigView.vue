<template>
  <div class="ml-2 mr-2">
    <VCard title="OAuth 应用管理">
      <VCardText>
        <VBtn
          color="primary"
          @click="createApp"
        >
          创建应用
        </VBtn>
        <VBtn
          class="ml-2"
          @click="loadApps"
        >
          <template #prepend>
            <CommonIcon icon="mdi-refresh" class="mb-1" />
          </template>
          刷新
        </VBtn>
        <VBtn class="ml-2" @click="SfcUtils.openUrl('https://mjt233.github.io/saltedfishcloud-backend/oauth/')">
          <template #prepend>
            <CommonIcon icon="mdi-open-in-new" class="mb-1" />
          </template>
          开放平台文档
        </VBtn>
        
        <!-- OAuth应用列表表格 -->
        <VDataTable
          mobile-breakpoint="md"
          :headers="headers"
          :items="appsList"
          :loading="isLoading"
          loading-text="加载中，在路上了在路上了...(っ °Д °;)っ"
          no-data-text="没有数据捏~ヾ(•ω•`)o"
          :server-side="true"
          :items-per-page="pagination.itemsPerPage"
          :page="pagination.page"
          :items-length="pagination.totalItems"
          class="mt-4"
          disable-sort
          color="primary"
          items-per-page-text="每页大小"
          page-text="第 {0} 页，共 {1} 页"
          @update:options="onPaginationChange"
        >
          <template #item.name="{ item }">
            <div class="d-inline-flex align-center">
              <img
                v-if="item.icon"
                :src="item.icon"
                class="app-icon mr-2"
              > {{ item.name }}  
            </div>
          </template>
          <template #item.isEnabled="{ item }">
            <VChip :color="item.isEnabled ? 'success' : 'error'">
              {{ item.isEnabled ? '已启用' : '已禁用' }}
            </VChip>
          </template>
          
          <template #item.actions="{ item }">
            <div class="d-inline-flex">
              <VBtn
                variant="text"
                size="small"
                color="primary"
                @click="showKey(item)"
              >
                查看密钥
              </VBtn>
              <VBtn
                variant="text"
                color="primary"
                size="small"
                @click="editApp(item)"
              >
                编辑
              </VBtn>
              <VBtn
                variant="text"
                color="error"
                size="small"
                @click="deleteApp(item)"
              >
                删除
              </VBtn>
            </div>
          </template>
        </VDataTable>
      </VCardText>
    </VCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import {
  CommonPageInfo, 
  IdType, 
  JsonResult, 
  LoadingManager, 
  MethodInterceptor, 
  ThirdPartyApp 
} from 'sfc-common'
import API from 'sfc-common/api'
import SfcUtils from 'sfc-common/utils/SfcUtils'

const props = defineProps({
  /**
   * 管理员后台界面上下文
   */
  adminContext: {
    type: Object as PropType<AdminContext>,
    default: undefined
  }
})

// 加载管理器
const lm = new LoadingManager()

// 表格列定义
const headers = [
  { title: '名称', key: 'name', sortable: false },
  { title: '应用介绍', key: 'describeContent', sortable: false },
  { title: '联系邮箱', key: 'email', sortable: false },
  { title: '状态', key: 'isEnabled', sortable: false },
  { title: '操作', key: 'actions', sortable: false }
]

// 分页信息
const pagination = reactive({
  page: 1,
  itemsPerPage: 10,
  totalItems: 0
})

// 应用列表
const appsList = ref<ThirdPartyApp[]>([])
// 是否加载中
const isLoading = lm.getLoadingRef()

// 数据加载代理
const actions = MethodInterceptor.createAsyncActionProxy({
  async loadData(page: number, size: number) {
    const apps = (await SfcUtils.request(API.oauth.listThirdPartyApp({page, size}))).data.data
    return apps
  },
  async delApp(appIds: IdType[]) {
    return await SfcUtils.request(API.oauth.deleteThirdPartyApp(appIds))
  }
}, true, lm)


// 加载应用列表
async function loadApps() {
  const result = await actions.loadData(pagination.page - 1, pagination.itemsPerPage)
  appsList.value = result.content
  pagination.totalItems = result.totalCount
}

// 分页变化处理
function onPaginationChange({ page, itemsPerPage }: { page: number, itemsPerPage: number }) {
  pagination.page = page
  pagination.itemsPerPage = itemsPerPage
  loadApps()
}


// 删除应用
async function deleteApp(app: ThirdPartyApp) {
  await SfcUtils.confirm(`确定要删除应用 "${app.name}" 吗？`, '删除确认')
  try {
    await actions.delApp([app.id])
    loadApps() // 重新加载列表
  } catch (error) {
    console.error('删除应用失败:', error)
  }
}

function openAppDialog(app?: ThirdPartyApp) {
  const isCreate = !app
  const inst = SfcUtils.openComponentDialog(ThirdPartyAppForm, {
    title: isCreate ? '修改 OAuth 应用' : '创建 OAuth 应用',
    persistent: true,
    props: {
      initValue: app
    },
    async onConfirm() {
      const form = inst.getInstAsForm()
      const v = await form.validate()
      if (!v.valid) {
        return false
      }
      const res = await form.submit({ showError: false })
      if (res.success) {
        const afterSaveAppData = (res.data?.data as JsonResult<ThirdPartyApp>).data
        if (isCreate) {
          // 新创建的应用立即生成密钥
          lm.beginLoading()
          SfcUtils.request(API.oauth.generateNewOauthAppKey(afterSaveAppData.id))
            .then(keyInfo => {
              SfcUtils.openComponentDialog(ThirdPartyAppKeyRawInfo, {
                title: '初始密钥',
                persistent: true,
                props: {
                  keyInfo: keyInfo.data.data
                },
                extraDialogOptions: {
                  maxWidth: '420px',
                  dense: true,
                  confirmText: '好的，我已妥善保管密钥'
                },
                showCancel: false
              })
            })
            .finally(() => lm.closeLoading())
          SfcUtils.snackbar('创建成功')
        } else {
          SfcUtils.snackbar('修改成功')
        }
        loadApps()
        return true
      }
      return false
    },
  })
}

function showKey(app: ThirdPartyApp) {
  SfcUtils.openComponentDialog(ThirdPartyAppKeyList, {
    title: '密钥列表',
    props: {
      appId: app.id
    },
    extraDialogOptions: {
      maxWidth: '1200px'
    },
  })
}

/**
 * 修改应用
 * @param app 应用信息对象
 */
function editApp(app: ThirdPartyApp) {
  openAppDialog(app)
}
/**
 * 创建应用
 */
function createApp() {
  openAppDialog()
}

// 初始化数据
onMounted(() => {
  loadApps()
})
</script>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { AdminContext } from 'sfc-common'
import { CommonIcon, ThirdPartyAppKeyList, ThirdPartyAppKeyRawInfo } from 'sfc-common/components'
import ThirdPartyAppForm from 'sfc-common/components/form/ThirdPartyAppForm.vue'

export default defineComponent({
  name: 'ThirdPartyAppConfigView'
})
</script>

<style>
.app-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}
</style>