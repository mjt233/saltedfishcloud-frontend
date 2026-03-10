<template>
  <v-card style="overflow: hidden;">
    <!-- 头部 -->
    <v-list-item :prepend-avatar="avatar">

      <!-- 标题 -->
      <div style="margin: 8px 0">
        <v-list-item-title class="headline">
          登录账号
        </v-list-item-title>
        <v-list-item-subtitle>开启云存储之旅</v-list-item-subtitle>
      </div>
    </v-list-item>

    <!-- 表单 -->
    <v-card-text>
      <base-form
        ref="form"
        :submit-action="doLogin"
        :auto-loading="true"
        :model-value="formData"
      >
        <v-row>
          <v-col :xs="8">
            <v-text-field
              v-model="formData.username"
              color="primary"
              :label="'用户名'"
              variant="underlined"
              autocapitalize="false"
              :rules="[Validators.notNull('用户名不能为空')]"
            />
          </v-col>
          <v-col
            v-if="!plain"
            style="max-width: 120px"
            class="text-body-2"
            align-self="center"
          >
            <div>
              <router-link
                to="/register"
                href="javascript:;"
                tabindex="-1"
                class="text-primary link"
              >
                去注册
              </router-link>
            </div>
          
          </v-col>
        </v-row>
        <v-row>
          <v-col :xs="8">
            <v-text-field
              v-model="formData.password"
              color="primary"
              :label="'密码'"
              variant="underlined"
              type="password"
              :rules="[Validators.notNull('密码不能为空'), Validators.minLen('密码至少需要6位', 6)]"
              @keyup.enter="emit('submit')"
            />
          </v-col>
          <v-col
            v-if="!plain"
            style="max-width: 120px"
            class="text-body-2"
            align-self="center"
          >
            <div>
              <router-link
                to="/forget"
                href="javascript:;"
                tabindex="-1"
                class="text-primary link"
              >
                忘记密码？
              </router-link>
            </div>
          </v-col>
        </v-row>
      </base-form>
      <v-btn
        v-if="showLogin"
        style="margin-top: 14px"
        color="primary"
        @click="emit('submit')"
      >
        登录
      </v-btn>

      <!-- 第三方平台登录 -->
      <template v-if="availableThirdPlatformList.length">

        <VDivider v-if="showLogin" class="mt-3 pb-2" />
        <VRow>
          <VCol
            v-for="item in availableThirdPlatformList"
            :key="item.type"
            cols="12"
            sm="6"
          >
            <VListItem
              class="third-platform"
              @click="doThirdPlatformLogin(item)"
            >
              <div class="d-flex align-center">
                <CommonIcon
                  style="height: 32px;"
                  :icon="item.icon"
                  :size="32"
                  :title="item.name"
                  hover-color="rgb(var(--v-theme-primary))"
                  class="mr-1"
                />
                使用 {{ item.name }} 账号登录
              </div>
            </VListItem>
          </VCol>
        </VRow>
      </template>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { deconstructForm } from 'sfc-common/utils/FormUtils'
const form = ref()
const formData = reactive({
  username: '',
  password: ''
})

const avatar = getContext().defaultAvatar
const props = defineProps({
  /**
   * 是否只显示登录输入组件
   */
  plain: {
    type: Boolean,
    default: false
  },
  /**
   * 是否显示登录按钮
   */
  showLogin: {
    type: Boolean,
    default: true
  },
  /**
   * 是否显示第三方平台登录
   */
  showThirdPartyPlatform: {
    type: Boolean,
    default: true
  }
})

const thirdPlatformList = ref([]) as Ref<ThirdPartyAuthPlatform[]>
const availableThirdPlatformList = computed(() => thirdPlatformList.value.filter(e => e.isEnable && e.authUrl))
const emit = defineEmits(['submit', 'success', 'thirdLoginBegin', 'thirdLoginEnd'])

async function doLogin() {
  const session = getContext().session.value
  // 登录
  // 设置token
  const loginRet = await SfcUtils.request(API.user.login(formData.username, formData.password))
  session.setToken(loginRet.data.data)
      
  // 获取用户信息
  const userInfoRet = await SfcUtils.request(API.user.getUserInfo())
  session.setUserInfo(userInfoRet.data.data)
  doLoginSuccess(userInfoRet.data.data, loginRet.data.data)
}

async function loadThirdPlatformList() {
  try {
    thirdPlatformList.value = (await SfcUtils.request(API.oauth.listPlatform())).data.data
  } catch (err) {
    if (err != 'cancel') {
      console.error(err)
      SfcUtils.snackbar(err)
    }
  }
}
function doLoginSuccess(user: RawUser, token: string) {
  const session = getContext().session.value
  session.setToken(token)
  session.setUserInfo(user)
  emit('success')
}

async function doThirdPlatformLogin(platform: ThirdPartyAuthPlatform) {
  try {
    emit('thirdLoginBegin')
    const res = await UserService.startThirdPlatformLogin(platform)
    if (res.success) {
      doLoginSuccess(res.result?.user as RawUser, res.token as string)
    }
  } catch (err) {
    if (err != 'cancel') {
      console.error(err)
      SfcUtils.snackbar(err)
    }
  } finally {
    emit('thirdLoginEnd')
  }
}
if (props.showThirdPartyPlatform) {
  loadThirdPlatformList()
}

defineExpose(deconstructForm(form))
</script>

<script lang="ts">
import API from 'sfc-common/api'
import { Validators } from 'sfc-common/core/helper/Validators'
import { getContext } from 'sfc-common/core/context'
import { computed, defineComponent, reactive, Ref, ref } from 'vue'
import { RawUser, ThirdPartyAuthPlatform, UserService } from 'sfc-common'
import { CommonIcon } from '../common'
import SfcUtils from 'sfc-common/utils/SfcUtils'

export default defineComponent({
  name: 'LoginForm'
})
</script>

<style scoped>
.third-platform:hover {
  color: rgb(var(--v-theme-primary));
}
</style>