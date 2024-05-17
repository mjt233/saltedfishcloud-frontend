<template>
  <base-form ref="formRef" :model-value="formData" :submit-action="actions.submit">
    <form-row>
      <form-col>
        {{ fileName }}
      </form-col>
    </form-row>
    <form-row>
      <form-col top-label label="生成类型">
        <template #label>
          生成类型
          <v-tooltip top>
            <template #activator="{ props: vProps }">
              <v-icon
                style="margin-right: 12px"
                size="18"
                dark
                v-bind="vProps"
              >
                mdi-help-circle
              </v-icon>
            </template>
            <p>按路径：下载链接与文件路径进行绑定（注意：绑定的不是文件，是路径），可设定有效期。</p>
            <br>
            <p>按MD5：只要网盘中仍然存在该份文件，无论是在其他网盘，以何种文件名和路径存在，都能被下载到</p>
          </v-tooltip>
        </template>
        <div class="d-flex align-center">
          <v-radio-group
            v-model="formData.type"
            class="hide-details"
            inline
          >
            <v-radio
              color="primary"
              label="按路径"
              value="path"
            />
            <v-radio
              color="primary"
              label="按MD5"
              value="md5"
            />
          </v-radio-group>
        </div>
      </form-col>
    </form-row>
    <v-divider style="margin-bottom: 12px" />
    <v-window v-model="formData.type">
      <v-window-item value="md5">
        <div class="tip" style="margin-top: 12px">
          无需设置
        </div>
      </v-window-item>
      <v-window-item value="path">
        <form-row style="padding-top: 12px;">
          <form-col class="mw-50">
            <form-select v-model="formData.expr" placeholder="有效期" :items="exprOptions" />
          </form-col>
          <form-col top-label label="启用预览" class="mw-50">
            <template #label>
              <div
                class="d-flex align-center"
                style="position: relative;margin-top: 12px;font-size: 12px;"
              >
                启用预览
                <v-tooltip top>
                  <template #activator="{ props: vProps }">
                    <v-icon
                      style="margin-right: 24px"
                      size="18"
                      dark
                      v-bind="vProps"
                    >
                      mdi-help-circle
                    </v-icon>
                  </template>
                  <span>若关闭预览，浏览器中打开链接时将永远弹出下载，而不会使用浏览器内置的在线预览</span>
                </v-tooltip>
              </div>
            </template>
            <v-switch
              v-model="formData.enablePreview"
              hide-details
              style="position: relative; top: -6px;"
              color="primary"
            />
          </form-col>
        </form-row>
      </v-window-item>
    </v-window>
  </base-form>
</template>

<script setup lang="ts">
import API from 'sfc-common/api'
import BaseForm from 'sfc-common/components/common/BaseForm.vue'
import { SelectOption } from 'sfc-common/model'
import { CommonForm, defineForm } from 'sfc-common/utils/FormUtils'
import SfcUtils from 'sfc-common/utils/SfcUtils'
const formRef = ref() as Ref<CommonForm>
const props = defineProps({
  uid: {
    type: [Number, String],
    default: 0
  },
  path: {
    type: String,
    default: '/'
  },
  fileName: {
    type: String,
    default: ''
  },
  md5: {
    type: String,
    default: ''
  }
})
const emits = defineEmits(['submit'])
type CreateType = 'path' | 'md5'
const exprOptions: SelectOption[] = [
  {
    title: '1天',
    value: 1
  },
  {
    title: '7天',
    value: 7
  },
  {
    title: '30天',
    value: 30
  },
  {
    title: '永久',
    value: -1
  }
]
const formInst = defineForm({
  actions: {
    async submit() {
      if (formData.type == 'path') {
        const token = (await SfcUtils.request(API.resource.getFileDC(props.uid, props.path, props.fileName, props.md5, formData.expr))).data.data
        return SfcUtils.getApiUrl(API.resource.downloadUseFileDC(token, !formData.enablePreview, props.fileName))
      } else {
        return SfcUtils.getApiUrl(API.resource.downloadFileByMD5(props.md5, props.fileName))
      }
    }
  },
  formData: {
    expr: 1,
    enablePreview: true,
    type: 'path' as CreateType
  },
  formRef: formRef,
  validators: {},
  throwError: true
})
const { formData, actions, validators, loadingRef, loadingManager  } = formInst


defineExpose(formInst)
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'

export default defineComponent({
  name: 'CreateLinkForm'
})
</script>