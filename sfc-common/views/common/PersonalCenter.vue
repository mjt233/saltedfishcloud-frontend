<template>
  <VCard style="max-width: 640px;" class="mt-2 ma-auto">
    <VCardTitle v-if="tabHistory.length > 0 || curTabTitle" class="d-inline-flex align-center">
      <VBtn
        v-if="tabHistory.length"
        variant="text"
        icon="mdi-arrow-left"
        class="mr-2"
        @click="gobackTab"
      />
      {{ curTabTitle }}
    </VCardTitle>
    <VCardText>
      <div v-if="hasLogin">
        <VWindow v-model="curTab" disabled>
          <VWindowItem value="mainCard">
            <loading-mask ref="loading" type="linear" />
            <!-- <v-progress-linear v-if="loading" indeterminate /> -->
            <v-list style="background-color: transparent; overflow: hidden;">
              <v-list-subheader>个人信息</v-list-subheader>
              <v-list-item v-ripple title="头像">
                <template #append>
                  <user-avatar
                    style="cursor: pointer;"
                    title="点击更换"
                    :uid="session.user.id"
                    :name="session.user.name"
                    :size="48"
                    class="elevation-1"
                    @click="doUploadAvatar"
                  />
                </template>
              </v-list-item>
              <v-divider />
              <v-list-item v-ripple min-height="48" title="用户ID">
                <template #append>
                  <span class="list-content">{{ session.user.id }}</span>
                </template>
              </v-list-item>
              <v-list-item v-ripple min-height="48" title="用户名">
                <template #append>
                  <span class="list-content">{{ session.user.name }}</span>
                </template>
              </v-list-item>
              <v-list-item
                v-ripple
                min-height="48"
                title="邮箱"
              >
                <template #append>
                  <template v-if="session.user.email">
                    <span class="list-content">{{ session.user.email }}<v-icon style="margin-left: 6px" color="primary" @click="showEmailDialog = true">mdi-pencil</v-icon></span>
                  </template>
                  <template v-else>
                    <span class="list-content link"><a class="text-decoration-none text-primary" @click="showEmailDialog = true">立即绑定</a></span>
                  </template>
                </template>
              </v-list-item>
              <v-list-item v-ripple min-height="48" title="身份">
                <template #append>
                  <span class="list-content">{{ session.user.role }}</span>
                </template>
          
              </v-list-item>
              <v-divider />
              <v-list-item v-ripple min-height="48" @click="showPasswordDialog = true">
                修改密码
              </v-list-item>
              <v-divider />
              <v-list-item v-ripple min-height="48" title="存储使用情况">
                <template #append>
                  <div style="width: 180px">
                    <div class="list-content" style="text-align: right; margin-bottom: 6px">
                      {{ StringFormatter.toSize(quotaUsed.used) }} / {{ StringFormatter.toSize(quotaUsed.quota) }}
                    </div>
                    <v-progress-linear
                      :color="quotaColor"
                      rounded
                      height="5"
                      :model-value="quotaUsed.used"
                      :max="quotaUsed.quota"
                    />
                  </div>
                </template>
              </v-list-item>
              <v-divider />
              <v-list-item title="黑暗模式" height="48">
                <template #append>
                  <dark-switch />
                </template>
              </v-list-item>
              <v-divider />
              <v-list-item
                v-ripple
                style="cursor: pointer;"
                title="第三方应用授权"
                subtitle="查看和撤销对第三方OAuth应用和服务的授权"
                append-icon="mdi-chevron-right"
                @click="switchTab('oauthAppManager', '第三方应用授权');loadAuthList()"
              />
              <v-divider />
              <v-list-subheader>第三方平台关联</v-list-subheader>
              <v-list-item v-if="platformLoadingCnt > 0">
                <template #title>
                  <VProgressCircular indeterminate color="primary" /> 加载中
                </template>
              </v-list-item>
              <template v-else>
                <template v-if="thirdPartyAuthPlatformList.length">
                  <v-list-item v-for="item in thirdPartyAuthPlatformList" :key="item.type" style="animation: up-in .2s;">
                    <template #title>
                      <CommonIcon :icon="item.icon" :title="item.name" :size="36" /> {{ item.name }}
                    </template>
                    <template #append>
                      <span v-if="thirdPartyPlatformUserMap[item.type]" class="text-success">
                        已绑定
                        <CommonIcon
                          color="success"
                          icon="mdi-check-circle"
                          :size="14"
                        />
                      </span>
                      <span v-else class="link" @click="assocPlatform(item)">去绑定</span>
                    </template>
                  </v-list-item>
                </template>
                <v-list-item v-else title="第三方平台不可用" />
              </template>
            </v-list>
            <base-dialog
              v-model="showEmailDialog"
              title="绑定邮箱"
              :hide-btn="true"
              persistent
            >
              <bind-email-form ref="emailRef" />
              <template #actions>
                <v-btn color="primary" @click="submitEamil">
                  绑定
                </v-btn>
                <v-btn color="primary" @click="showEmailDialog = false">
                  取消
                </v-btn>
              </template>
            </base-dialog>
            <base-dialog
              v-model="showPasswordDialog"
              :loading="changePasswordLoading"
              title="修改密码"
              @cancel="showPasswordDialog = false"
              @confirm="doChangePassword"
            >
              <change-passowrd-form
                ref="changePasswordRef"
                :uid="session.user.id"
                @submit="doChangePassword"
              />
            </base-dialog>
          </VWindowItem>
      
          <VWindowItem value="oauthAppManager">
            <p class="text-body-1">
              跟踪您与第三方应用的关系
            </p>
            <ThirdPartyAppAuthList
              ref="authList"
              :key="curAppAuth?.appId"
              class="mt-4"
              style="min-height: 600px;"
              :uid="session.user.id"
              @item-click="curAppAuth = $event; switchTab('appAuthentication', $event.thirdPartyApp?.name || '')"
            />
          </VWindowItem>

          <VWindowItem value="appAuthentication" style="min-height: 600px;" class="pl-2 pr-2">
            <ThirdPartyAppAuthDetail
              v-if="curAppAuth"
              :key="curAppAuth.appId"
              :item="curAppAuth"
              @revoke="gobackTab();curAppAuth = undefined"
            />
          </VWindowItem>
        </VWindow>
      </div>
      <div v-else>
        未登录
      </div>
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
import DarkSwitch from 'sfc-common/components/common/DarkSwitch.vue'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import LoadingMask from 'sfc-common/components/common/LoadingMask.vue'
import { EventNameConstants } from 'sfc-common/core/constans/EventName'
import { EmptyTip, UserAvatar } from 'sfc-common/components'
import ChangePassowrdForm from 'sfc-common/components/form/ChangePassowrdForm.vue'
import BaseDialog from 'sfc-common/components/common/BaseDialog.vue'
import BindEmailForm from 'sfc-common/components/form/BindEmailForm.vue'
import { CommonForm } from 'sfc-common/utils/FormUtils'
const loading = ref()
const authList = ref()
const showPasswordDialog = ref(false)
const session = getContext().session
const hasLogin = ConditionFunction.hasLogin(getContext())
const changePasswordRef = ref()
const changePasswordLoading = ref(false)
const thirdPartyAuthPlatformList = ref<ThirdPartyAuthPlatform[]>([])
const thirdPartyPlatformUserMap = reactive({}) as {[type:string]: ThirdPartyPlatformUser}
const platformLoadingCnt = ref(0)
const emailRef = ref() as Ref<CommonForm>
let quotaUsed = reactive({
  used: 0,
  quota: 0
})
const quotaColor = ref('primary')
const showEmailDialog = ref(false)
const curTab = ref('mainCard')
const curTabTitle = ref('')
const tabHistory = ref(reactive([])) as Ref<{tab: string, title: string}[]>
const curAppAuth = ref() as Ref<ThirdPartyAppAuthorization | undefined>

function switchTab(target: string, title: string) {
  tabHistory.value.push({
    tab: curTab.value,
    title: curTabTitle.value
  })
  curTab.value = target
  curTabTitle.value = title
}

function gobackTab() {
  if (tabHistory.value.length) {
    const item = tabHistory.value.pop() as {tab: string, title: string}
    curTab.value = item.tab
    curTabTitle.value = item.title
  }
}
/**
 * 加载第三方平台授权列表
 */
function loadAuthList() {
  authList.value?.loadData()
}

// 获取存储使用情况
SfcUtils.request(API.user.getQuotaUsed()).then(e => {
  const info = e.data.data
  if (!info) {
    return
  }
  quotaUsed.used = info.used
  quotaUsed.quota = info.quota
  const ratio = quotaUsed.used / quotaUsed.quota
  if (ratio >= 0.8) {
    quotaColor.value = 'warning'
  } else if (ratio >= 0.9) {
    quotaColor.value = 'error'
  }
})

// 执行头像上传
const doUploadAvatar = async() => {
  FileUtils.openFileDialog().then(async e => {
    const file = e[0]
    if (file.size > 1024 * 1024 * 3) {
      SfcUtils.snackbar('文件不能大于3MiB')
      return
    }
    try {
      loading.value.startLoading()
      await SfcUtils.axios(API.user.uploadAvatar(file))
      getContext().eventBus.value.emit(EventNameConstants.AVATAR_UPDATE, {
        uid: session.value.user.id,
        name: session.value.user.name
      })
    } catch(err) {
      SfcUtils.snackbar((err as any).toString())
    } finally {
      loading.value.closeLoading()
    }
  })
}

const doChangePassword = async() => {
  try {
    changePasswordLoading.value = true
    const res = await changePasswordRef.value.submit()
    SfcUtils.snackbar('修改成功，请重新登录', 5000, { showClose: true })
    getContext().routeInfo.value.router?.push('/login')
  } catch(err) {
    console.error(err)
    SfcUtils.snackbar((err as any).toString())
  } finally {
    changePasswordLoading.value = false
  }
}

const submitEamil = async() => {
  
  const success = (await emailRef.value.submit()).success
  if (success) {
    showEmailDialog.value = false
  }
}

async function loadThirdPlatformList() {
  try {
    Object.keys(thirdPartyPlatformUserMap).forEach(type => delete thirdPartyPlatformUserMap[type])
    platformLoadingCnt.value++
    thirdPartyAuthPlatformList.value = (await SfcUtils.request(API.oauth.listPlatform())).data.data.filter(e => e.authUrl)
    if (thirdPartyAuthPlatformList.value.length > 0) {
      (await SfcUtils.request(API.oauth.listAssocPlatformUser(session.value.user.id))).data.data.forEach(u => {
        thirdPartyPlatformUserMap[u.platformType] = u
      })
    }
  } finally {
    platformLoadingCnt.value--
  }
}

/**
 * 关联第三方平台
 * @param platform 要关联的第三方平台
 */
async function assocPlatform(platform: ThirdPartyAuthPlatform) {
  if (thirdPartyPlatformUserMap[platform.type]) {
    return
  }
  const res = await UserService.startThirdPlatformLogin(platform)
  if (res.success) {
    SfcUtils.snackbar('关联成功')
    await loadThirdPlatformList()
  }
}

loadThirdPlatformList()
</script>

<script lang="ts">
import * as FileUtils from 'sfc-common/utils/FileUtils'
import { defineComponent, reactive, Ref, ref } from 'vue'
import { getContext } from 'sfc-common/core/context'
import { ConditionFunction } from 'sfc-common/core/helper/ConditionFunction'
import API from 'sfc-common/api'
import { StringFormatter } from 'sfc-common/utils/StringFormatter'
import { ThirdPartyAppAuthorization, ThirdPartyAuthPlatform, ThirdPartyPlatformUser } from 'sfc-common/model'
import { UserService } from 'sfc-common/core'
import CommonIcon from 'sfc-common/components/common/CommonIcon.vue'
import ThirdPartyAppAuthList from 'sfc-common/components/common/OAuth/ThirdPartyAppAuthList.vue'
import ThirdPartyAppAuthDetail from 'sfc-common/components/common/OAuth/ThirdPartyAppAuthDetail.vue'
export default defineComponent({
  name: 'PersonalCenter'
})
</script>


<style scoped lang="scss">
.v-list-item {
  // cursor: pointer;
  background-color: rgba(223, 223, 223, 0);
  transition: all .4s;
}
.list-content {
  color: rgb(var(--v-theme-on-surface), .7);
  font-size: 14px;
}

.v-divider {
  margin: 8px 0;
}

.platform-item {
  position: relative;

  .platform-item-check-icon {
    position: absolute;
    right: 3px;
    bottom: -6px;
  }
}
</style>