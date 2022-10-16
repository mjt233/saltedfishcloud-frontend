<template>
  <base-form
    ref="formRef"
    :model-value="formData"
    :submit-action="actions.submit"
    label-width="auto"
    dense
  >
    <form-row style="padding: 0 12px">
      <form-col top-label label="挂载类型">
        <form-select :items="selectOptions" />
      </form-col>
      <form-col top-label label="目录名称">
        <text-input v-model="formData.name" />
      </form-col>
    </form-row>
    <form-row style="padding: 0 12px">
      <form-col top-label label="挂载目录">
        <span class="link" style="margin-right: 12px">{{ selectPath }}</span>
        <v-btn flat @click="actions.selectPath">
          浏览
        </v-btn>
      </form-col>
    </form-row>
    
    <div style="overflow: hidden;width: 100%;">
      <config-node-group
        style="width: 100%"
        :use-stick-title="false"
        :items="configGroup"
        @node-change="nodeChange"
      >
        <template #title="param">
          <span style="color: rgb(var(--v-theme-primary)); font-weight: 600;margin-left: 12px;font-size: 18px;">{{ param.group.title || param.group.name }}</span>
        </template>
      </config-node-group>
    </div>
    
  </base-form>
</template>

<script setup lang="ts">
import API from '@/api'
import BaseForm from '@/components/common/BaseForm.vue'
import { FormRow, FormCol, FormSelect, ConfigNodeGroup } from '@/components'
import { ConfigNodeModel, IdType, MountPoint, NameValueType, SelectOption } from '@/core/model'
import { CommonForm, defineForm } from '@/utils/FormUtils'
import SfcUtils from '@/utils/SfcUtils'
const formRef = ref() as Ref<CommonForm>
const props = defineProps({
  uid: {
    type: [String, Number] as PropType<IdType>,
    default: 0
  }
})
const emits = defineEmits(['submit'])
const selectPath = ref('/')
const nodeChange = (e: NameValueType) => {
  mountConfig[e.name] = e.value
  formData.params = JSON.stringify(mountConfig)
  console.log(formData)
}
const selectOptions: Ref<SelectOption[]> = ref([])
const configGroup: Ref<ConfigNodeModel[]> = ref([])

let mountConfig = {} as any
const formInst = defineForm({
  actions: {
    selectPath() {
      SfcUtils.selectPath({
        uid: props.uid,
        path: '/',
        title: '选择挂载位置',
        filter(e) {
          return e.dir && !e.mountId
        }
      }).then(async(path) => {
        selectPath.value = path
        try {
          loadingRef.value = true
          const res = await SfcUtils.request(API.resource.getNodeInfo(props.uid, path))
          formData.nid = (res.data.data.pop()?.id || props.uid).toString()
        } catch(err) {
          SfcUtils.snackbar(err)
        } finally {
          loadingRef.value = false
        }
        
      })
    },
    async submit() {
      const config = API.mountPoint.saveMountPoint(formData)
      return await SfcUtils.request(config)
    },
    async loadSystem() {
      const res = await SfcUtils.request(API.mountPoint.listAvailableFileSystem())
      res.data.data.forEach(describe => {
        selectOptions.value.push({
          value: describe.protocol,
          title: describe.name,
          action() {
            configGroup.value = describe.configNode
            formData.protocol = describe.protocol
            mountConfig = {}
            describe.configNode.flatMap(e => e.nodes).forEach(node => {
              if (node) {
                mountConfig[node.name] = node.defaultValue
              }
            })
          }
        })
      })
    }
  },
  formData: {
    uid: props.uid,
    path: '/',
    protocol: '',
    name: '挂载点1',
    params: '{}',
    nid: ''
  } as MountPoint,
  formRef: formRef,
  validators: {},
  throwError: true
})
const { formData, actions, validators, loadingRef, loadingManager  } = formInst

actions.loadSystem()

defineExpose(formInst)
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'

export default defineComponent({
  name: 'CreateMountPointForm'
})
</script>