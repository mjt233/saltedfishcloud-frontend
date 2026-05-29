<template>
  <VCard
    class="mt-12"
    width="calc(100% - 32px)"
    max-width="480px"
  >
    <VCardTitle>
      <VListItem title="设备授权" subtitle="输入设备上显示的用户码以完成授权">
        <template #prepend>
          <VIcon
            icon="mdi-television-play"
            size="40"
            color="primary"
            class="mr-3"
          />
        </template>
      </VListItem>
      <VDivider class="mt-2" />
    </VCardTitle>

    <VCardText>
      <VForm ref="formRef">
        <VContainer>
          <VTextField
            v-model="userCode"
            variant="underlined"
            label="用户码"
            color="primary"
            placeholder="例：ABCD-EFGH"
            :rules="[Validators.notNull('用户码不能为空')]"
            @keyup.enter="doConfirm"
          />
          <VBtn color="primary" @click="doConfirm">
            确认
          </VBtn>
        </VContainer>
      </VForm>
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
/** 用户码输入值，若 URL 参数中携带 user_code 则自动填写 */
const userCode = ref(new URL(location.href).searchParams.get('user_code') || '')

/** 表单引用，用于触发校验 */
const formRef = ref()

/** 用户确认输入后触发，携带用户输入的用户码 */
const emit = defineEmits<{
  /** @param userCode 用户输入的用户码 */
  (e: 'confirm', userCode: string): void
}>()

/**
 * 校验表单并向父组件发送确认事件
 */
async function doConfirm() {
  const validateRes: ValidateResult = await formRef.value.validate()
  if (!validateRes.valid) {
    return
  }
  emit('confirm', userCode.value)
}
</script>

<script lang="ts">
import { defineComponent, defineEmits, ref } from 'vue'
import { ValidateResult } from 'sfc-common'
import { Validators } from 'sfc-common/core/helper/Validators'

export default defineComponent({
  name: 'UserCodeView'
})
</script>
