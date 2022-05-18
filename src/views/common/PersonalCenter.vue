<template>
  <div v-if="hasLogin">
    <v-card max-width="640px" style="margin: 0 auto; overflow: hidden;">
      <loading-mask ref="loading" type="linear" />
      <!-- <v-progress-linear v-if="loading" indeterminate /> -->
      <v-list bg-color="background">
        <v-list-subheader>个人信息</v-list-subheader>
        <v-list-item v-ripple title="头像">
          <user-avatar
            :uid="session.user.id"
            :name="session.user.name"
            :size="48"
            class="elevation-1"
            @click="doUploadAvatar"
          />
        </v-list-item>
        <v-divider />
        <v-list-item v-ripple min-height="48" title="用户ID">
          <span class="list-content">{{ session.user.id }}</span>
        </v-list-item>
        <v-list-item v-ripple min-height="48" title="用户名">
          <span class="list-content">{{ session.user.name }}</span>
        </v-list-item>
        <v-list-item
          v-ripple
          min-height="48"
          title="邮箱"
        >
          <template v-if="session.user.email">
            <span class="list-content">{{ session.user.email }}<v-icon style="margin-left: 6px" color="primary" @click="showEmailDialog = true">mdi-pencil</v-icon></span>
          </template>
          <template v-else>
            <span class="list-content"><a class="text-decoration-none text-primary" @click="showEmailDialog = true">立即绑定</a></span>
          </template>
        </v-list-item>
        <v-list-item v-ripple min-height="48" title="身份">
          <span class="list-content">{{ session.user.role }}</span>
        </v-list-item>
        <v-divider />
        <v-list-item v-ripple min-height="48" @click="showPasswordDialog = true">
          修改密码
        </v-list-item>
        <v-divider />
        <v-list-item v-ripple min-height="48" title="存储使用情况">
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
        </v-list-item>
        <v-divider />
        <v-list-item title="黑暗模式" height="48">
          <dark-switch />
        </v-list-item>
      </v-list>
      <base-dialog
        v-model="showEmailDialog"
        title="绑定邮箱"
        :hide-btn="true"
        persistent
      >
        <bind-email-form ref="emailRef" />
        <template #actions>
          <v-btn color="surface" @click="submitEamil">
            绑定
          </v-btn>
          <v-btn color="surface" @click="showEmailDialog = false">
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
    </v-card>
  </div>
  <div v-else>
    未登录
  </div>
</template>

<script setup lang="ts">
import DarkSwitch from '@/components/common/DarkSwitch.vue'
import SfcUtils from '@/utils/SfcUtils'
import LoadingMask from '@/components/common/LoadingMask.vue'
import { EventNameConstants } from '@/core/constans/EventName'
import UserAvatar from '@/components/common/UserAvatar.vue'
import ChangePassowrdForm from '@/components/form/ChangePassowrdForm.vue'
import BaseDialog from '@/components/common/BaseDialog.vue'
import BindEmailForm from '@/components/form/BindEmailForm.vue'
import { CommonForm } from '@/utils/FormUtils'
const loading = ref()
const showPasswordDialog = ref(false)
const session = context.session
const hasLogin = ConditionFunction.hasLogin(context)
const changePasswordRef = ref()
const changePasswordLoading = ref(false)
const emailRef = ref() as Ref<CommonForm>
let quotaUsed = reactive({
  used: 0,
  quota: 0
})
const quotaColor = ref('primary')
const showEmailDialog = ref(false)

// 获取存储使用情况
axios(API.user.getQuotaUsed()).then(e => {
  const info = e.data.data
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
      context.eventBus.value.emit(EventNameConstants.AVATAR_UPDATE, {
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
    context.routeInfo.value.router?.push('/login')
  } catch(err) {
    console.log(err)
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
</script>

<script lang="ts">
import FileUtils from '@/utils/FileUtils'
import { defineComponent, reactive, Ref, ref } from 'vue'
import { context } from '@/core/context'
import { ConditionFunction } from '@/core/helper/ConditionFunction'
import API from '@/api'
import { StringFormatter } from '@/utils/StringFormatter'
import axios from '@/plugins/axios'
export default defineComponent({
  name: 'PersonalCenter'
})
</script>


<style scoped>
.v-list-item {
  cursor: pointer;
  background-color: rgba(223, 223, 223, 0);
  transition: all .4s;
}
.list-content {
  color: grey;
  font-size: 14px;
}

.v-divider {
  margin: 8px 0;
}
</style>