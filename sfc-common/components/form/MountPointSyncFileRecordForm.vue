<template>
  <base-form ref="formRef" :model-value="formData" :submit-action="actions.submit">
    <div>{{ message }}</div>
    
    <div class="d-flex align-center">
      <v-checkbox
        v-model="formData.isComputeMd5"
        color="primary"
        label="计算文件md5"
        hide-details
      >
        <template #label>
          计算文件md5
          <v-tooltip location="bottom">
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
            <p>当被挂载的文件系统文件系统中未提供md5信息时，由咸鱼云网盘自行计算。</p>
            <p>注意：在本次同步时计算md5需要从被挂载的文件系统中读取整个文件，对于网络文件系统可能会产生较大的网络IO压力和产生目标文件系统的流量费用</p>
          </v-tooltip>
        </template>
      </v-checkbox>
    </div>
  </base-form>
</template>

<script setup lang="ts">
/* VS Code代码片段生成 prefix: vform */
import { API, CommonForm, IdType, MountPointSyncFileRecordParam, defineForm } from 'sfc-common'
import SfcUtils from 'sfc-common/utils/SfcUtils'
const formRef = ref() as Ref<CommonForm>
const props = defineProps({
  id: {
    type: [Number, String] as PropType<IdType>,
    default: undefined
  },
  message: {
    type: String,
    default: '是否同步文件存储记录？'
  }
})
const emits = defineEmits(['submit'])

const formInst = defineForm({
  actions: {
    submit() {
      return SfcUtils.request(API.mountPoint.syncFileRecord(formData))
    }
  },
  formData: {
    id: props.id,
    isComputeMd5: false
  } as MountPointSyncFileRecordParam,
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
  name: 'MountPointSyncFileRecordForm'
})
</script>