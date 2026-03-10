<template>
  <div>
    <VContainer>
      <VTextField
        :model-value="keyInfo.name"
        label="密钥名称"
        readonly
        variant="underlined"
        color="primary"
      />
      <VTextField
        :model-value="keyInfo.appId"
        label="App ID"
        readonly
        variant="underlined"
        color="primary"
      >
      
        <template #append-inner>
          <CommonIcon
            v-ripple
            hover-color="rgb(var(--v-theme-primary))"
            style="cursor: pointer;"
            icon="mdi-content-copy"
            title="复制"
            @click="copyToClipboard(keyInfo.appId)"
          />
        </template>
      </VTextField>
      <VTextField
        :model-value="keyInfo.clientSecret"
        label="Client Secret"
        readonly
        variant="underlined"
        color="primary"
      >
        <template #append-inner>
          <CommonIcon
            v-ripple
            hover-color="rgb(var(--v-theme-primary))"
            style="cursor: pointer;"
            icon="mdi-content-copy"
            title="复制"
            @click="copyToClipboard(keyInfo.clientSecret)"
          />
        </template>
      </VTextField>
      <span class="tip">
        <p>提示：您有且仅有本次一次机会能看到客户端密钥（Client Secret），请确保妥善保存后再关闭该页面。</p>
        <p>您也可以在后续继续创建多个密钥</p>
      </span>
    </VContainer>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  keyInfo: {
    type: Object as PropType<ThirdPartyAppKeyVo>,
    required: true
  }
})

async function copyToClipboard(val: string | number) {
  await SfcUtils.copyToClipboard(typeof val === 'number' ? val.toString() : val)
  SfcUtils.snackbar('已复制')
}
</script>

<script lang="ts">
import { ThirdPartyAppKeyVo } from 'sfc-common/model'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'
import { CommonIcon } from '..'

export default defineComponent({
  name: 'ThirdPartyAppKeyRawInfo'
})
</script>