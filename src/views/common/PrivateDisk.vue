<template>
  <div v-if="session.user.id != 0">
    <h3>这是私人网盘</h3>
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
        <v-btn color="surface" @click="showLogin = true">
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
const session = context.session
const showLogin = ref(false)
const loginForm = ref() as Ref<CommonForm>
const login = async() => {
  if((await loginForm.value.submit()).success) {
    showLogin.value = false
  }
}

</script>

<script lang="ts">
import { context } from '@/core/context'
import { defineComponent, Ref, ref } from 'vue'
export default defineComponent({
  name: 'PrivateDisk'
})
</script>