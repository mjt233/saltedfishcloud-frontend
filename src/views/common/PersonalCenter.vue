<template>
  <div v-if="hasLogin">
    <v-card max-width="640px" style="margin: 0 auto">
      <v-list bg-color="background">
        <v-list-subheader>个人信息</v-list-subheader>
        <v-list-item v-ripple title="头像">
          <v-avatar size="48" class="elevation-1">
            <v-img :src="avatarImgUrl" />
          </v-avatar>
        </v-list-item>
        <v-divider />
        <v-list-item v-ripple min-height="48" title="用户ID">
          <span class="list-content">{{ userInfo.id }}</span>
        </v-list-item>
        <v-list-item v-ripple min-height="48" title="用户名">
          <span class="list-content">{{ userInfo.name }}</span>
        </v-list-item>
        <v-list-item v-ripple min-height="48" title="邮箱">
          <span class="list-content">{{ userInfo.email || '未设置' }}</span>
        </v-list-item>
        <v-list-item v-ripple min-height="48" title="身份">
          <span class="list-content">{{ userInfo.role }}</span>
        </v-list-item>
        <v-divider />
        <v-list-item v-ripple min-height="48">
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
    </v-card>
  </div>
  <div v-else>
    未登录
  </div>
</template>

<script async setup lang="ts">
import DarkSwitch from '@/components/Common/DarkSwitch.vue'
const userInfo = context.session.value.user
const hasLogin = ConditionFunction.hasLogin(context)

const baseUrl = axios.defaults.baseURL || ''
const avatarImgUrl = StringUtils.appendPath(baseUrl, API.user.getAvatar(userInfo.name).url)
let quotaUsed = reactive({
  used: 0,
  quota: 0
})
const quotaColor = ref('primary')
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
</script>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue'
import { context } from '@/core/context'
import { ConditionFunction } from '@/core/helper/ConditionFunction'
import API from '@/api'
import { StringUtils } from '@/utils/StringUtils'
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