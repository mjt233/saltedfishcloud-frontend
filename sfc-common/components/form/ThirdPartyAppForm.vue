<template>
  <base-form ref="formRef" :model-value="formData" :submit-action="actions.submit">
    <loading-mask :loading="loadingRef" type="circular" />
    <v-row>
      <v-col class="d-flex align-center justify-center" cols="2">
        <div>
          <img
            v-if="formData.icon"
            width="64px"
            height="64px"
            :src="formData.icon"
            style="border-radius: 50%;cursor: pointer;"
            title="修改图标"
            @click="selectIcon"
          >
          <div v-else class="empty-icon tip" @click="selectIcon">
            图标<common-icon icon="mdi-upload" />
          </div>
        </div>
      </v-col>
      <v-col>
        <text-input v-model="formData.name" label="应用名称" :rules="validators.name" />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <text-input v-model="formData.callbackUrl" label="回调URL" :rules="validators.callbackUrl" />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <text-input v-model="formData.email" label="联系邮箱" :rules="validators.email" />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-textarea
          v-model="formData.describeContent"
          label="应用介绍"
          variant="underlined"
          color="primary"
          max-rows="7"
          rows="1"
          auto-grow
          :rules="validators.describeContent"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-checkbox-btn v-model="formData.isEnabled" label="启用该应用" color="primary" />
      </v-col>
    </v-row>
  </base-form>
</template>

<script setup lang="ts">
/* VS Code代码片段生成 prefix: vform */
import { CommonForm, defineForm, FormFieldType, openFileDialog, StringFormatter, ThirdPartyApp, Validators } from 'sfc-common'
const formRef = ref() as Ref<CommonForm>
const props = defineProps({
  initValue: {
    type: Object as PropType<ThirdPartyApp>,
    default: undefined
  }
})
const emits = defineEmits(['submit'])

const formInst = defineForm({
  actions: {
    async submit() {
      return await SfcUtils.request(API.oauth.saveThirdPartyApp(formData))
    }
  },
  formData: reactive({
    isEnabled: true
  }) as ThirdPartyApp,
  formRef: formRef,
  validators: {
    name: [
      Validators.notNull('应用名称不能为空')
    ],
    callbackUrl: [
      Validators.notNull('回调URL不能为空'),
      Validators.isUrl(),
      Validators.maxLen(null, 1024)
    ],
    email: [
      (e: FormFieldType) => {
        if (e === '' || e === null || e === undefined) {
          return true
        } else {
          return Validators.isEmail()(e)
        }
      }
    ],
    describeContent: [
      Validators.maxLen(null, 1024)
    ]
  },
  throwError: true
})
const { formData, actions, validators, loadingRef, loadingManager  } = formInst


async function selectIcon() {
  try {
    loadingManager.beginLoading()
    const file:File = (await openFileDialog(false, 'image/*'))[0]
    // 将file转为base64
    const url = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        resolve(reader.result as string)
      }
      reader.onerror = reject
    })
    if (url) {
      if (url.length > 512 * 1024) {
        throw new Error(`编码后的图标文件过大(${StringFormatter.toSize(url.length, true)})，请选择小于384KiB的图片`)
      }
      formData.icon = url
    }
  } catch (err) {
    if (err != 'cancel') {
      SfcUtils.snackbar(err)
    }
  } finally {
    loadingManager.closeLoading()
  }
}

onMounted(() => {
  if (props.initValue) {
    Object.assign(formData, props.initValue)
  }
})

defineExpose(formInst)
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, reactive, onMounted } from 'vue'
import { LoadingMask, TextInput } from '../common'
import CommonIcon from '../common/CommonIcon.vue'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import API from 'sfc-common/api'

export default defineComponent({
  name: 'ThirdPartyAppForm'
})
</script>

<style scoped>
.empty-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 64px;
  height: 64px;
  border: 1px dashed #ccc;
  border-radius: 50%;
  transition: all .2s;
  cursor: pointer;
}
.empty-icon:hover {
  border: 1px dashed rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-primary));
}
</style>