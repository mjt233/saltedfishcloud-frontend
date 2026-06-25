<template>
  <base-form ref="formRef" :model-value="formData" :submit-action="actions.submit">
    <LoadingMask :loading="loading" />

    <VRow>
      <VCol>
        <VTextField
          v-model="formData.fileName"
          label="保存的文件名"
          :rules="validators.fileName"
          :readonly="readOnly"
          placeholder="请输入保存文件名"
        />
      </VCol>
    </VRow>

    <VRow v-if="showTargetUidSelector">
      <VCol>
        <v-select
          v-model="formData.targetUid"
          :items="targetUidOptions"
          label="保存位置"
          color="primary"
          variant="underlined"
          :readonly="readOnly"
          :rules="validators.targetUid"
        />
      </VCol>
    </VRow>

    <VRow>
      <VCol>
        <PathSelector
          v-model="formData.savePath"
          :uid="formData.targetUid"
          label="保存目录"
          placeholder="点击选择保存路径"
          :rules="validators.savePath"
          :readonly="readOnly"
        />
      </VCol>
    </VRow>
  </base-form>
</template>

<script setup lang="ts">
import { CommonForm, IdType, Validators, defineForm, getContext } from 'sfc-common'
import { DataManagerAPI } from '../../api'
import type { ClaimParam } from '../../model'

const SfcUtils = window.SfcUtils
const PathSelector = window.Components.PathSelector
const formRef = ref() as Ref<CommonForm>

const props = defineProps({
  /**
   * 当前操作用户ID，用于发起认领请求时传递uid参数
   */
  uid: {
    type: [Number, String] as PropType<IdType>,
    required: true
  },

  /**
   * 表单初始值
   */
  initObject: {
    type: Object as PropType<ClaimParam>,
    default: () => ({
      invalidDataId: 0,
      targetUid: 0,
      fileName: '',
      savePath: '/'
    })
  },

  /**
   * 是否显示目标网盘选择项
   */
  showTargetUidSelector: {
    type: Boolean,
    default: false
  },

  /**
   * 目标网盘候选项
   */
  targetUidOptions: {
    type: Array as PropType<{ title: string, value: IdType }[]>,
    default: () => [
      {
        title: '我的网盘',
        value: getContext().session.value.user.id
      },
      {
        title: '公共网盘',
        value: '0'
      }
    ]
  },

  /**
   * 是否只读
   */
  readOnly: {
    type: Boolean,
    default: false
  }
})

const formInst = defineForm({
  actions: {
    /**
     * 提交认领请求
     */
    async submit() {
      return await SfcUtils.request(DataManagerAPI.claim(formData, props.uid))
    }
  },
  formData: {
    invalidDataId: 0,
    targetUid: 0,
    fileName: '',
    savePath: '/'
  } as ClaimParam,
  formRef: formRef,
  validators: {
    fileName: [Validators.notNull('文件名不能为空'), Validators.maxLen('文件名不能超过255个字符', 255)],
    targetUid: [Validators.notNull('请选择保存位置')],
    savePath: [Validators.notNull('必须选择保存路径')]
  },
  throwError: true
})

const { formData, actions, validators, loadingManager } = formInst
const loading = loadingManager.getLoadingRef()

// 初始化表单数据
Object.assign(formData, props.initObject)

watch(() => formData.targetUid, () => formData.savePath = '/')

defineExpose(formInst)
</script>

<script lang="ts">
import { defineComponent, defineProps, Ref, ref, PropType, watch } from 'vue'

export default defineComponent({
  name: 'InvalidDataClaimForm'
})
</script>
