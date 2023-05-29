<template>
  <div style="max-width: 470px;margin: 24px auto">
    <user-register-form ref="form" @submit="submit" />
  </div>
</template>

<script setup lang="ts">
import { UserRegisterForm } from 'sfc-common/components'
import { CommonForm } from 'sfc-common/utils/FormUtils'
import SfcUtils from 'sfc-common/utils/SfcUtils'
const form = ref() as Ref<CommonForm>
const submit = async() => {
  if((await form.value.submit()).success) {
    SfcUtils.snackbar('好耶~注册成功~ ヾ(≧▽≦*)o', 5000, { showClose: true })
    context.routeInfo.value.router?.push('/login')
  }
}
</script>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref } from 'vue'
import { context } from 'sfc-common/core/context'

export default defineComponent({
  name: 'RegisterView'
})
</script>