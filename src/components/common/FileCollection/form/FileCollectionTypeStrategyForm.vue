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
    </v-row>
  </base-form>
</template>

<script setup lang="ts">
import BaseForm from '@/components/common/BaseForm.vue'
import FormSelect from '@/components/common/FormSelect.vue'
const formRef = ref()
const typeStrategy = ref('all')
const typeStrategyOption: SelectOption[] = [
  {
    title: '无限制',
    value: 'all',
    action() {
      formData.extPattern = null
      formData.pattern = ''
      formData.field = []
    }
  },
  {
    title: '指定类型',
    value: 'type'
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
    extPattern: null,
    field: []
  },
  validators: {},
  actions: {}
})
const { formData } = formInst
defineExpose(formInst)
// const props = defineProps({})
</script>

<script lang="ts">
import { SelectOption } from '@/core/model/Common'
import { defineForm } from '@/utils/FormUtils'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, reactive, watch } from 'vue'

export default defineComponent({
  name: 'FileCollectionTypeStrategyForm'
})
</script>