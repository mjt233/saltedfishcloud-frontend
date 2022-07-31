<template>
  <div v-if="session.user.id != 0">
    <file-browser
      ref="browser"
      v-model:path="path"
      :file-system-handler="handler"
      :read-only="false"
      :uid="session.user.id"
      :top-buttons="context.menu.value.fileBrowserBtn"
      auto-compute-height
    />
  </div>
  <div v-else class="d-flex justify-center">
    <v-card
      color="background"
      title="访问受限"
      max-width="640px"
      width="100%"
    >
      <v-card-content>
        <p style="margin-bottom: 16px">
          私人网盘功能需要登录账号才能使用捏~φ(゜▽゜*)♪
        </p>
        <v-btn color="primary" @click="showLogin = true">
          立即登录
        </v-btn>
        <base-dialog
          v-model="showLogin"
          width="640px"
          hide-btn
          @cancel="showLogin = false"
        >
          <login-form
            ref="loginForm"
            style="width: 100%"
            plain
            @submit="login"
          />
          <template #actions>
            <v-btn
              color="primary"
              @click="showLogin = false"
            >
              取消
            </v-btn>
          </template>
        </base-dialog>
      </v-card-content>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import BaseDialog from '@/components/common/BaseDialog.vue'
import LoginForm from '@/components/form/LoginForm.vue'
import { CommonForm } from '@/utils/FormUtils'
import FileBrowser from '@/components/common/FileBrowser.vue'
import { FileSystemHandlerFactory } from '@/core/serivce/FileSystemHandler'
const session = context.session
const browser = ref()
const showLogin = ref(false)

const loginForm = ref() as Ref<CommonForm>
const login = async() => {
  if((await loginForm.value.submit()).success) {
    showLogin.value = false
  }
}

const handler = computed(() => {
  return FileSystemHandlerFactory.getFileSystemHandler(ref(session.value.user.id))
})
const path = ref('/');

// 根据路由设定初始路径
(() => {
  const pathParams = context.routeInfo.value.curr?.params.path as string[] | undefined
  if (pathParams) {
    const initPath = '/' + pathParams.join('/')
    path.value = initPath
  }
})()

const updateUrl = () => {
  context.routeInfo.value.router?.replace(StringUtils.appendPath('/private', path.value.substring(1)))
}
watch(path, () => {
  updateUrl()
})
</script>

<script lang="ts">
import { context } from '@/core/context'
import { computed, defineComponent, onMounted, Ref, ref, watch } from 'vue'
import { StringUtils } from '@/utils/StringUtils'
export default defineComponent({
  name: 'PrivateDisk'
})
</script>