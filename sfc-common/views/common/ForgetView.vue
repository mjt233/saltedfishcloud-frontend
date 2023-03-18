<template>
  <div class="common-view" style="width: 100%;max-width: 480px">
    <v-card>
      <v-card-header>
        <v-card-title>找回账号</v-card-title>
      </v-card-header>
      <v-card-content>
        <forget-form ref="form" @submit="doReset" />
      </v-card-content>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import ForgetForm from 'sfc-common/components/form/ForgetForm.vue'
import { context } from 'sfc-common/core/context'
import SfcUtils from 'sfc-common/utils/SfcUtils'
const form = ref() as Ref<CommonForm>
const doReset = async() => {
  const result = await form.value.submit()
  if(result.success) {
    await SfcUtils.alert('重置成功！即将转跳到登录页面')
    context.routeInfo.value.router?.replace('/login')
  }
}
</script>

<script lang="ts">
import { defineComponent, Ref, ref } from 'vue'
import { CommonForm } from 'sfc-common/utils/FormUtils'

export default defineComponent({
  name: 'ForgetView'
})
</script>