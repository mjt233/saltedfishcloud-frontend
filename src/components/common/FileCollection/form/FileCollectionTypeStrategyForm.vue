<template>
  <base-form ref="formRef" :model-value="formData">
    <v-row class="form-row">
      <v-col class="mw-50">
        <span class="form-label">
          文件名约束：
        </span>
        <form-select
          v-model="typeStrategy"
          :items="typeStrategyOption"
          :disabled="readonly"
        />
      </v-col>
      <v-col v-if="typeStrategy == 'type'">
        <span class="form-label">
          选择类型：
        </span>
        <form-select
          v-model="acceptType"
          :disabled="readonly"
          multiple
          :items="typeOption"
        />
      </v-col>
      <v-col v-if="typeStrategy == 'regex'">
        <div class="form-label">
          自定义正则：
        </div>
        <text-input
          v-model="formData.pattern"
          class="dense-details"
          style="margin-top: 6px"
          :rules="validators.regex"
        />
      </v-col>
    </v-row>
    <v-row v-if="typeStrategy == 'field'">
      <v-col>
        <v-row>
          <v-col>
            <file-collection-field-option v-model="formData.field" :readonly="readonly" />
          </v-col>
        </v-row>
        <v-row class="form-row">
          <v-col>
            <v-row :align="'center'">
              <v-col class="form-label" style="max-width: 180px">
                <span>
                  
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
                    <p>字段模式需要设定文件名表达式用于构造提交的文件名</p>
                    <p>字段变量用法：${字段名}，内置的变量__ext__表示用户上传的文件拓展名，推荐一般放到末尾</p>
                    <p>表达式样例：${学号}-${学院}-${班级}-${姓名}.${__ext__}</p>
                    <p>提交文件后，将构造成：114514-茶艺学院-雷普1班-李天所.docx</p>
                  </v-tooltip>
                </span>
                <span>文件名表达式：</span>
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
const props = defineProps({
  initValue: {
    type: Object as PropType<CollectionInfo>,
    default: undefined
  },
  readonly: {
    type: Boolean,
    default: false
  }
})
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
    value: 'docx|doc|ppt|pptx|xls|xls|txt|md|pdf'
  },
  {
    title: '视频',
    value: 'mp4|mpeg|avi|mov|wmv|flv|3gp'
  },
  {
    title: '图片',
    value: 'jpg|jpeg|png|gif'
  },
  {
    title: '音频',
    value: 'mp3|wav|mid|asf|mpg|tti|flac|aif|aiff|ape'
  },
  {
    title: '压缩包',
    value: '7z|zip|rar|gz|img|iso|image|tar'
  }
]
const acceptType = ref([]) as Ref<string[]>
watch(acceptType, () => {

  // 将选择的类型拼接到正则表达式中
  const selectType = acceptType.value.length ? acceptType.value : []
  
  let ext = selectType.join('|')
  if (ext.length) {
    formData.pattern = `\\.(${ext})$`
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



onMounted(async() => {
  if (props.initValue) {
    const obj = props.initValue
    if (obj.field && obj.field.length > 0) {
      await nextTick()
      typeStrategy.value = 'field'
      obj.field.forEach(e => formData.field.push(e))
      await nextTick()
      formData.extPattern = obj.extPattern || ''
      formData.pattern = obj.pattern || ''

    }
    if(obj.pattern) {
      const matchOptions = typeOption.filter(e => obj.pattern && obj.pattern?.indexOf(e.value) != -1)
      const restructPattern = `\\.(${matchOptions.map(e => e.value).join('|')})$`
      if (matchOptions.length > 0 && restructPattern.length == obj.pattern.length) {
        typeStrategy.value = 'type'
        await nextTick()
        acceptType.value = matchOptions.map(e => e.value)
      }
    }
  }
})
</script>

<script lang="ts">
import { SelectOption } from '@/core/model/Common'
import { defineForm, FormFieldType } from '@/utils/FormUtils'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, reactive, watch, onMounted, nextTick } from 'vue'
import { Validators } from '@/core/helper/Validators'
import { CollectionInfo, CollectionInfoField } from '@/core/model/FileCollection'

export default defineComponent({
  name: 'FileCollectionTypeStrategyForm'
})
</script>