<template>
  <base-form
    ref="formRef"
    :model-value="formData"
    :submit-action="actions.submit"
    label-width="auto"
    :auto-loading="true"
    :son-forms="sonForms"
    row-height="72px"
    dense
  >
    <loading-mask :loading="loadingRef" /> 
    <form-row style="padding: 0 12px">
      <form-col>
        <form-select
          v-model="formData.protocol"
          placeholder="挂载类型"
          :items="selectOptions"
          :disabled="readOnly || isEdit"
        />
      </form-col>
      <form-col>
        <TextInput v-model="formData.name" label="目录名称" :readonly="readOnly || isEdit" />
      </form-col>
    </form-row>
    <form-row style="padding: 0 12px">
      <form-col top-label label="挂载目录">
        <span class="link" style="margin-right: 12px">{{ selectPath }}</span>
        <v-btn v-if="!readOnly && !isEdit" flat @click="actions.selectPath">
          浏览
        </v-btn>
      </form-col>
    </form-row>

    <v-divider class="form-divider" />
    <configurable-form
      ref="mountForm"
      :read-only="readOnly"
      style="padding: 0 12px"
      :nodes="configGroup"
      @change="nodeChange"
    />
    
    
  </base-form>
</template>

<script setup lang="ts">
import API from 'sfc-common/api'
import BaseForm from 'sfc-common/components/common/BaseForm.vue'
import { FormRow, FormCol, FormSelect, ConfigNodeGroup, ConfigNode, TextInput } from 'sfc-common/components'
import { ConfigNodeModel, IdType, MountPoint, NameValueType, SelectOption } from 'sfc-common/model'
import { CommonForm, defineForm } from 'sfc-common/utils/FormUtils'
import SfcUtils from 'sfc-common/utils/SfcUtils'
const formRef = ref() as Ref<CommonForm>
const props = defineProps({
  uid: {
    type: [String, Number] as PropType<IdType>,
    default: 0
  },
  dataId: {
    type: [String, Number],
    default: undefined
  },
  readOnly: {
    type: Boolean,
    default: false
  },
  initValue: {
    type: Object as PropType<MountPoint>,
    default: undefined
  }
})
const mountForm = ref()
const sonForms = ref([mountForm])
const emits = defineEmits(['submit', 'error', 'loaded'])
const selectPath = ref('/')
const nodeChange = (e: NameValueType) => {
  mountConfig[e.name] = e.value
  formData.params = JSON.stringify(mountConfig)
}
const selectOptions: Ref<SelectOption[]> = ref([])
const configGroup: Ref<ConfigNodeModel[]> = ref([])

let mountConfig = {} as any
const parseParams = async(mp: MountPoint) => {

  Object.assign(formData, mp)
  const opt = selectOptions.value.find(e => e.value == formData.protocol)
  opt && opt.action && opt.action()
  const params = JSON.parse(formData.params)
  configGroup.value.filter(e => e.nodes)
    .flatMap(e => e.nodes)
    .forEach(node => {
      if (node) {
        const val = params[node.name]
        node.value = (val === null || val === undefined) ? node.defaultValue : val
      }
    })
  mountConfig = JSON.parse(formData.params)
  
  selectPath.value = (await SfcUtils.request(API.resource.parseNodeId(formData.uid, formData.nid))).data.data
}
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
    /**
     * 加载可用的文件系统
     */
    async loadSystem() {
      try {
        const res = await SfcUtils.request(API.mountPoint.listAvailableFileSystem())
        res.data.data.forEach(describe => {
          selectOptions.value.push({
            value: describe.protocol,
            title: describe.name,
            action() {
              // 编辑初始数据且未切换过挂载类型时，不需要重置挂载配置参数。
              if (!(isEdit.value && props.initValue?.protocol == formData.protocol)) {
                mountConfig = {}
                describe.configNode.flatMap(e => e.nodes).forEach(node => {
                  if (node) {
                    mountConfig[node.name] = node.defaultValue
                    if (node.value === undefined || node.value === null) {
                      node.value = node.defaultValue
                    }
                  }
                })
              }
              configGroup.value = describe.configNode
              formData.protocol = describe.protocol
            }
          })
        })
        return true
      } catch(err) {
        // 忽略权限问题
        if (SfcUtils.isForbidden(err)) {
          return false
        } else {
          return err
        }
      }
    },
    async loadById() {
      if (props.dataId) {
        try {
          const res = await SfcUtils.request(API.mountPoint.getById(props.dataId))  
          const data = res.data.data
          await parseParams(data)
          return true
        } catch (err) {
          if (SfcUtils.isForbidden(err)) {
            return false
          } else {
            return err
          }
        }
      }
    }
  },
  formData: reactive({
    uid: props.uid,
    path: '/',
    protocol: '',
    name: '挂载点1',
    params: '{}',
    nid: props.uid
  }) as MountPoint,
  formRef: formRef,
  validators: {},
  throwError: true
})
const isEdit = ref<boolean>(false)
const { formData, actions, validators, loadingRef, loadingManager  } = formInst


onMounted(async() => {
  try {
    if(await actions.loadSystem()) {
      if (props.initValue) {
        isEdit.value = !!props.initValue.id
        parseParams(props.initValue)
      } else if(await actions.loadById()) {
        emits('loaded', formData)
      }
    }
  } catch(err) {
    emits('error', err)
    console.error(err)
  }
})
defineExpose(formInst)
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted } from 'vue'
import { reactive } from 'vue'

export default defineComponent({
  name: 'CreateMountPointForm'
})
</script>

<style lang="scss" scoped>
.form-divider {
  padding-bottom: 24px;
  width: 50%;
  margin: 0 auto;
}
</style>