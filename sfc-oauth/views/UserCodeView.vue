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
      <VAlert
        v-if="errorMsg"
        type="error"
        variant="tonal"
        class="mb-4"
        :text="errorMsg"
      />
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
/** 错误代码与用户提示的映射 */
const errorMap: Record<string, string> = {
  invalid_user_code: '用户码无效，请检查后重试'
}

const curUrl = new URL(location.href)
const errorCode = curUrl.searchParams.get('error')

/** 错误提示信息，根据 URL 中的 error 参数自动映射，无匹配时直接展示原始错误码 */
const errorMsg = ref(errorCode ? (errorMap[errorCode] || `错误：${errorCode}`) : '')

/** 用户码输入值，若 URL 参数中携带 user_code 则自动填写 */
const userCode = ref(curUrl.searchParams.get('user_code') || '')

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
