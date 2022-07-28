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
      <div class="d-flex align-center">
        <v-icon icon="mdi-alert-circle" color="warning" />
        {{ msg }}
      </div>
      <not-found-tip />
    </div>
    <div v-if="collectionInfo?.state == 'OPEN'">
      <v-card :title="'文件收集：' + collectionInfo?.title">
        <v-card-content style="position: relative">
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

          <!-- 字段约束类型的表单填写部分 -->
          <template v-if="useField">
            <v-row>
              <v-col><v-divider style="margin: 12px 0" /></v-col>
            </v-row>
            <v-row>
              <v-col>文件提交需要填写信息：</v-col>
            </v-row>
            <v-row class="form-row" :style="{'--form-label-width': fieldLabelWidth}">
              <v-col v-for="(field,index) in collectionInfo.field" :key="index">
                <span class="form-label">{{ field.name }}：</span>
                <text-input v-if="field.type == 'TEXT'" v-model="formData.field[index].value" :rules="fieldRules[index]" />
                <form-select v-else v-model="formData.field[index].value" :items="selectOptions[field.name]" />
              </v-col>
            </v-row>
          </template>
          <v-row v-else class="form-row">
            <v-col>
              <span class="form-label" style="max-width: 180px">文件重命名：</span>
              <text-input v-model="formData.filename" :rules="validators.filename" />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-file-input
                v-model="file"
                label="请选择文件"
                color="primary"
                show-size
                :variant="'filled'"
                :rules="validators.fileRules"
              >
                <template #selection="{ fileNames }">

                  <v-chip v-for="(filename, idx) in fileNames" :key="idx" color="primary">
                    {{ filename }}
                  </v-chip>
                </template>
              </v-file-input>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-progress-linear
                v-if="uploadStatus.uploading"
                :max="uploadStatus.total"
                :model-value="uploadStatus.loaded"
                color="primary"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-btn
                :disabled="loadingRef"
                class="submit-btn"
                color="primary"
                @click="submit"
              >
                提交
              </v-btn>
            </v-col>
          </v-row>
        </v-card-content>
      </v-card>
    </div>
  </base-form>
  <div v-if="collectionInfo?.state == 'CLOSED'" class="error-tip">
    <v-icon icon="mdi-close-circle" color="error" /> 已停止接受提交
  </div>
  <div v-if="needLogin" class="error-tip">
    <v-icon icon="mdi-alert-circle" color="warning" /> 访问受限，需要<span class="link" @click="toLogin">登录</span>
  </div>
</template>

<script setup lang="ts">
import API from '@/api'
import BaseForm from '@/components/common/BaseForm.vue'
import { CollectionInfo, CollectionInfoField, CollectionSubmitInfo } from '@/core/model/FileCollection'
import { CommonForm, defineForm, ValidatorFunction } from '@/utils/FormUtils'
import SfcUtils from '@/utils/SfcUtils'
import { StringFormatter } from '@/utils/StringFormatter'
import { AxiosError } from 'axios'
import MultiLineText from '@/components/common/MultiLineText.vue'
import TextInput from '@/components/common/TextInput.vue'
import FormSelect from '../../FormSelect.vue'
import NotFoundTip from '../../NotFoundTip.vue'
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
const needLogin = ref(false)
const emits = defineEmits(['submit', 'finish'])
const selectOptions = reactive({} as { [name: string]: SelectOption[] })
const collectionInfo = ref() as Ref<CollectionInfo>
const notFound = ref(false)
const msg = ref('')
const fieldLabelWidth = ref('120px')
const fieldRules = ref([]) as Ref<ValidateRule[][]>
const file = ref() as Ref<File[]>

// 提交上传信息
const uploadStatus = reactive({
  uploading: false,
  total: 0,
  loaded: 0
})
// 是否使用了字段约束
const useField = ref(false)

const session = context.session

// 表单基本属性定义
const formInst = defineForm({
  actions: {

    // 表单提交方法
    async submit() {
      if (uploadStatus.uploading) {
        throw new Error('已经在上传了')
      }
      try {
        uploadStatus.uploading = true
        const conf = API.collection.submit(props.cid, props.vid, formData, file.value[0])
        conf.onUploadProgress = (e: Prog) => {
          console.log(e)
          uploadStatus.total = e.total
          uploadStatus.loaded = e.loaded
        }
        await SfcUtils.request(conf)
        SfcUtils.snackbar('上传完成')
        emits('finish')
      } catch(err) {
        throw err
      } finally {
        uploadStatus.uploading = false
        uploadStatus.loaded = 0
      }
    },
    async loadData() {
      try {
        const data = (await SfcUtils.request(API.collection.getCollectionInfo(props.cid, props.vid))).data
        collectionInfo.value = data
        initFieldValidator()
        if(data.field && data.field.length > 0) {
          useField.value = true

          // 最长的字段名称长度，根据字段名称长度计算出合适的表单标签长度
          let maxLen = 0

          data.field.forEach(field => {
            if (field.name.length > maxLen) {
              maxLen = field.name.length
            }

            // 往表单数据中添加各个字段的响应式数据对象
            formData.field.push(reactive({
              name: field.name,
              value: field.value
            }))

            // 针对下拉选择类型的数据构建下拉选择候选项对象数组
            if (field.type == 'OPTION') {
              selectOptions[field.name] = field.options.map(option => {
                return {
                  title: option,
                  value: option
                }
              })
            }
          })

          // 计算表单标签长度，若超出设定的最大字段长度则使用最大字段长度
          const labelWidth = (maxLen + 1) * 16
          fieldLabelWidth.value = (labelWidth > props.maxFieldLabelWidth ? props.maxFieldLabelWidth : labelWidth) + 'px'
        }
      } catch(err) {
        if (err instanceof AxiosError) {
          if (err.code) {
            if ( err.code == '404') {
              notFound.value = true
              msg.value = (err as any).msg
            } else if (err.code == '401') {
              needLogin.value = true
            }
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
  validators: {
    fileRules: [
      (e: File[]) => {
        if (e && e.length > 0) {
          return true
        } else {
          return '请选择文件'
        }
      },
      (e: File[]) => {
        const maxSize = collectionInfo.value.maxSize
        if (maxSize != -1 && e[0].size > collectionInfo.value.maxSize) {
          return '文件过大，不能大于' + StringFormatter.toSize(maxSize)
        } else {
          return true
        }
      },
      (e: File[]) => {
        const extPattern = collectionInfo.value.extPattern
        if(useField.value && extPattern && extPattern.length > 0) {
          const extName = e[0].name.split('.').pop() as string
          return Validators.isMatchRegex(extPattern, '文件拓展名不符合该正则：' + extPattern)(extName)
        } else {
          return true
        }
      }
    ] as any as ValidateRule[],
    filename: [
      Validators.notNull('文件名不能为空'),
      (e: string) => {
        const pattern = collectionInfo.value.pattern
        if(!useField.value && pattern && pattern.length > 0) {
          return Validators.isMatchRegex(pattern, '文件名不符合要求')(e)
        } else {
          return true
        }
      }
    ]
  },
  throwError: true
})

const { formData, actions, validators, loadingRef, loadingManager } = formInst

/**
 * 初始化字段规则校验器
 */
const initFieldValidator = () => {
  const fields = collectionInfo.value.field
  if(!fields || fields.length == 0) {
    return
  }

  fields.forEach((field, index) => {
    const rules: ValidateRule[] = [Validators.notNull(field.name + '不能为空')]
    if (field.type == 'TEXT' && field.pattern && field.pattern.length > 0) {
      rules.push(Validators.isMatchRegex(field.pattern))
    }

    fieldRules.value[index] = rules
  })
}

const toLogin = async() => {
  await SfcUtils.openLoginDialog()
  setTimeout(() => {
    location.reload()  
  }, 300)
  
}
watch(file, () => {
  if(file.value && file.value.length > 0) {
    formData.filename = file.value[0].name
  } else {
    formData.filename = ''
  }
})
const submit = () => {
  emits('submit')
}
defineExpose(formInst)

onMounted(actions.loadData)
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted, reactive, watch } from 'vue'
import { SelectOption } from '@/core/model/Common'
import { Validators } from '@/core/helper/Validators'
import { ValidateRule } from '@/core/model/component/type'
import { Prog } from '@/utils/FileUtils/FileDataProcess'
import { context } from '@/core/context'

export default defineComponent({
  name: 'FileCollectionSubmitForm'
})
</script>


<style lang="scss" scoped>
.submit-btn {
  width: 100%;
}

.error-tip {
  display: flex;
  align-items: center;
  margin: 0 auto;
  width:100%;
  max-width: 320px;
  font-size: 21px;
  &>.v-icon {
    margin-right: 12px;
  }
}
</style>