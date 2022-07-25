<!-- 文件提交表单 -->

<template>
  <base-form
    ref="formRef"
    :model-value="formData"
    :submit-action="actions.submit"
    label-width="81px"
    row-height="64px"
  >
    <div v-if="notFound">
      {{ msg }}
    </div>
    <div v-else>
      <v-card :title="'文件收集：' + collectionInfo?.title">
        <v-card-content>
          <v-row class="form-row">
            <v-col>
              <span class="form-label">收集人：</span>
              <div>{{ collectionInfo?.nickname }}</div>
            </v-col>
            <v-col>
              <span class="form-label">截止日期：</span>
              <div>{{ toDate(collectionInfo?.expiredAt) }}</div>
            </v-col>
          </v-row>
          <v-row class="form-row">
            <v-col style="height: auto" class="align-start">
              <span class="form-label">描述：</span>
              <multi-line-text :text="collectionInfo?.describe" />
            </v-col>
          </v-row>
          <template v-if="collectionInfo?.field && collectionInfo.field.length > 0">
            <v-row>
              <v-col><v-divider style="margin: 12px 0" /></v-col>
            </v-row>
            <v-row>
              <v-col>文件提交需要填写信息：</v-col>
            </v-row>
            <v-row class="form-row" :style="{'--form-label-width': fieldLabelWidth}">
              <v-col v-for="(field,index) in collectionInfo.field" :key="index">
                <span class="form-label">{{ field.name }}：</span>
                <text-input v-if="field.type == 'TEXT'" v-model="formData.field[index].value" />
                <form-select v-else v-model="formData.field[index].value" :items="selectOptions[field.name]" />
              </v-col>
            </v-row>
          </template>
        </v-card-content>
      </v-card>
    </div>
  </base-form>
</template>

<script setup lang="ts">
import API from '@/api'
import BaseForm from '@/components/common/BaseForm.vue'
import { CollectionInfo, CollectionInfoField, CollectionSubmitInfo } from '@/core/model/FileCollection'
import { CommonForm, defineForm } from '@/utils/FormUtils'
import SfcUtils from '@/utils/SfcUtils'
import { StringFormatter } from '@/utils/StringFormatter'
import { AxiosError } from 'axios'
import MultiLineText from '@/components/common/MultiLineText.vue'
import TextInput from '@/components/common/TextInput.vue'
import FormSelect from '../../FormSelect.vue'
const toDate = StringFormatter.toDate
const formRef = ref() as Ref<CommonForm>
const props = defineProps({
  /**
   * 收集任务id
   */
  cid: {
    type: [Number, String],
    default: 0
  },
  /**
   * 校验id
   */
  vid: {
    type: String,
    default: ''
  },
  maxFieldLabelWidth: {
    type: Number,
    default: 128
  }
})
const emits = defineEmits(['submit'])
const selectOptions = reactive({} as { [name: string]: SelectOption[] })
const collectionInfo = ref() as Ref<CollectionInfo>
const notFound = ref(false)
const msg = ref('')
const fieldLabelWidth = ref('120px')
const formInst = defineForm({
  actions: {
    submit() {
      
    },
    async loadData() {
      try {
        const data = (await SfcUtils.request(API.collection.getCollectionInfo(props.cid, props.vid))).data
        collectionInfo.value = data
        if(data.field && data.field.length > 0) {
          let maxLen = 0
          data.field.forEach(field => {
            if (field.name.length > maxLen) {
              maxLen = field.name.length
            }
            formData.field.push(reactive({
              name: field.name,
              value: field.value
            }))
            if (field.type == 'OPTION') {
              selectOptions[field.name] = field.options.map(option => {
                return {
                  title: option,
                  value: option
                }
              })
            }
          })
          const labelWidth = (maxLen + 1) * 16
          fieldLabelWidth.value = (labelWidth > props.maxFieldLabelWidth ? props.maxFieldLabelWidth : labelWidth) + 'px'
        }
      } catch(err) {
        if (err instanceof AxiosError) {
          if (err.code && err.code == '404') {
            notFound.value = true
            msg.value = (err as any).msg
          }
        }
        SfcUtils.snackbar(err)
      }
    }
  },
  formData: {
    filename: '',
    field: []
  } as CollectionSubmitInfo,
  formRef: formRef,
  validators: {},
  throwError: true
})
const { formData, actions, validators, loadingRef, loadingManager } = formInst

defineExpose(formInst)

onMounted(actions.loadData)
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted, reactive } from 'vue'
import { SelectOption } from '@/core/model/Common'

export default defineComponent({
  name: 'FileCollectionSubmitForm'
})
</script>