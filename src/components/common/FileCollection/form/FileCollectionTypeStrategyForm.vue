<template>
  <base-form ref="formRef" :model-value="formData">
    <v-row class="form-row">
      <v-col>
        <v-row>
          <v-col class="form-label">
            文件名约束：
          </v-col>
          <v-col>
            <form-select v-model="typeStrategy" :items="typeStrategyOption" />
          </v-col>
        </v-row>
      </v-col>
      <v-col v-if="typeStrategy == 'type'">
        <v-row>
          <v-col class="form-label">
            选择类型：
          </v-col>
          <v-col>
            <form-select
              v-model="acceptType"
              multiple
              :items="typeOption"
            />
          </v-col>
        </v-row>
      </v-col>
      <v-col v-if="typeStrategy == 'regex'">
        <v-row :align="'center'">
          <v-col class="form-label">
            自定义正则：
          </v-col>
          <v-col>
            <text-input
              v-model="formData.pattern"
              class="dense-details"
              style="margin-top: 6px"
              :rules="validators.regex"
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row v-if="typeStrategy == 'field'">
      <v-col>
        <v-row>
          <v-col>
            <file-collection-field-option v-model="formData.field" />
          </v-col>
        </v-row>
        <v-row class="form-row">
          <v-col>
            <v-row :align="'center'">
              <v-col class="form-label" style="max-width: 140px">
                文件名表达式：
              </v-col>
              <v-col>
                <text-input
                  v-model="formData.pattern"
                  class="dense-details"
                  style="margin-top: 6px;position: relative; left: -18px;width: calc(100% + 18px);"
                  :rules="validators.nameExpress"
                />
              </v-col>
            </v-row>
          </v-col>
          <v-col>
            <v-row :align="'center'">
              <v-col class="form-label">
                后缀名正则：
              </v-col>
              <v-col>
                <text-input
                  v-model="formData.extPattern"
                  class="dense-details"
                  style="margin-top: 6px;"
                  :rules="validators.extRegex"
                />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </base-form>
</template>

<script setup lang="ts">
import BaseForm from '@/components/common/BaseForm.vue'
import FormSelect from '@/components/common/FormSelect.vue'
import TextInput from '../../TextInput.vue'
import FileCollectionFieldOption from './FileCollectionFieldOption.vue'
const formRef = ref()
const typeStrategy = ref('all')
const typeStrategyOption: SelectOption[] = [
  {
    title: '无限制',
    value: 'all',
    action() {
      formData.extPattern = ''
      formData.pattern = ''
      formData.field = []
    }
  },
  {
    title: '指定类型',
    value: 'type',
    action() {
      formData.extPattern = ''
      formData.pattern = ''
      formData.field = []
    }
  },
  {
    title: '字段约束',
    value: 'field',
    action() {
      formData.extPattern = ''
      formData.pattern = ''
    }
  },
  {
    title: '正则表达式',
    value: 'regex',
    action() {
      formData.field = []
      formData.extPattern = ''
      formData.pattern = ''
    }
  }
]
const typeOption: SelectOption[] = [
  {
    title: '文档',
    value: '|docx|doc|ppt|pptx|xls|xls|txt|md|pdf'
  },
  {
    title: '视频',
    value: '|mp4|mpeg|avi|mov|wmv|flv|3gp'
  },
  {
    title: '图片',
    value: '|jpg|jpeg|png|gif'
  },
  {
    title: '音频',
    value: '|mp3|wav|mid|asf|mpg|tti|flac|aif|aiff|ape'
  },
  {
    title: '压缩包',
    value: '|7z|zip|rar|gz|img|iso|image|tar'
  }
]
const acceptType = ref([]) as Ref<string[]>
watch(acceptType, () => {

  // 将选择的类型拼接到正则表达式中
  let ext = ''
  const selectType = acceptType.value.length ? acceptType.value : []
  selectType.forEach(e => {
    ext += e
  })
  if (ext.length) {
    formData.pattern = `\\.(${ext})$`.replace(/\(\|/, '(')
  } else {
    formData.pattern = ''
  }
})


const formInst = defineForm({
  formRef: formRef,
  formData: {
    pattern: '',
    extPattern: '',
    field: [] as CollectionInfoField[]
  },
  validators: {
    regex: [Validators.isRegex()],
    nameExpress: [Validators.notNull('文件名表达式不能为空'), (e: FormFieldType) => {
      // 校验当未添加字段时，文件名表达式是否为合法的正则
      if (!formData.field || (formData.field && formData.field.length == 0)) {
        return Validators.isRegex()(e)
      } else {
        return true
      }
    }],
    extRegex: [Validators.isRegex()]
  },
  actions: {}
})
const { formData, validators } = formInst
defineExpose(formInst)
// const props = defineProps({})
</script>

<script lang="ts">
import { SelectOption } from '@/core/model/Common'
import { defineForm, FormFieldType } from '@/utils/FormUtils'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, reactive, watch } from 'vue'
import { Validators } from '@/core/helper/Validators'
import { CollectionInfoField } from '@/core/model/FileCollection'

export default defineComponent({
  name: 'FileCollectionTypeStrategyForm'
})
</script>