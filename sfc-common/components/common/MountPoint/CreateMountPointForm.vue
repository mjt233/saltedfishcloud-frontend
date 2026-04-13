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
    <slot name="prepend" />
    <v-row>
      <v-col cols="12">
        <VSelect
          v-model="formData.protocol"
          class="pb-4"
          label="挂载类型"
          :items="selectOptions"
          hide-details
          :rules="validators.protocol"
          :readonly="readOnly || isEdit"
        />
      </v-col>
      <v-col cols="12">
        <VTextField v-model="formData.name" label="目录名称" :readonly="readOnly || isEdit" />
      </v-col>
      
      <v-col cols="12">
        <VTextField
          v-model="curSelectPath"
          label="挂载路径"
          hide-details
          readonly
          @focus="!readOnly && actions.selectPath()"
        />
      </v-col>
      <v-col cols="12">
        <div class="d-flex align-center">
          <v-switch
            v-model="formData.isProxyStoreRecord"
            :readonly="readOnly"
            color="primary"
            label="委托存储记录"
            hide-details
          >
            <template #label>
              委托存储记录
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
                <p>由系统自行维护该目录的文件信息并纳入默认搜索范围</p>
                <p>获取文件信息时不直接访问挂载的目标文件系统，在一些网络文件系统上可减少请求次数</p>
              </v-tooltip>
            </template>
          </v-switch>
        </div>
      </v-col>
    </v-row>

    <v-divider class="form-divider" />
    <ConfigurableForm
      ref="mountForm"
      :key="mountParam"
      class="mb-4"
      :read-only="readOnly"
      style="padding: 0"
      :nodes="configGroup"
      :use-vuetify-native-layout="true"
      @change="nodeChange"
    />
    
    <slot name="append" />
    
  </base-form>
</template>

<script setup lang="ts">
import API from 'sfc-common/api'
import BaseForm from 'sfc-common/components/common/BaseForm.vue'
import { FormRow, FormCol, FormSelect, ConfigNodeGroup, ConfigNode, TextInput } from 'sfc-common/components'
import { ConfigNodeModel, DiskFileSystemDescribe, IdType, MountPoint, NameValueType, SelectOption } from 'sfc-common/model'
import { CommonForm, defineForm } from 'sfc-common/utils/FormUtils'
import SfcUtils from 'sfc-common/utils/SfcUtils'
const formRef = ref() as Ref<CommonForm>
const props = defineProps({
  /**
   * 挂载点所属的网盘用户id
   */
  uid: {
    type: [String, Number] as PropType<IdType>,
    default: 0
  },
  /**
   * 挂载点id，当initValue为undefined时必填
   */
  dataId: {
    type: [String, Number],
    default: undefined
  },
  /**
   * 是否为只读模式
   */
  readOnly: {
    type: Boolean,
    default: false
  },
  /**
   * 初始化的挂载点值对象，传入该对象后不会触发提交事件
   */
  initValue: {
    type: Object as PropType<MountPoint>,
    default: undefined
  },
  /**
   * 默认路径
   */
  path: {
    type: String,
    default: undefined
  }
})
const mountForm = ref()
const sonForms = ref([mountForm])
const emits = defineEmits(['submit', 'error', 'loaded'])
const curSelectPath = ref('/')
let mountParam = ref({} as any)

// 挂载点配置节点变化事件
const nodeChange = (e: NameValueType) => {
  mountParam.value[e.name] = e.value
  formData.params = JSON.stringify(mountParam.value)
}

const selectOptions: Ref<SelectOption[]> = ref([])
const configGroup: Ref<ConfigNodeModel[]> = ref([])

const parseParams = async(mp: MountPoint) => {
  Object.assign(formData, mp)
  selectOptions.value.find(e => e.value == formData.protocol)?.action?.()

  const params = JSON.parse(formData.params)
  configGroup.value.filter(e => e.nodes)
    .flatMap(e => e.nodes)
    .forEach(node => {
      if (node) {
        const val = params[node.name]
        node.value = (val === null || val === undefined) ? node.defaultValue : val
      }
    })
  mountParam.value = reactive(JSON.parse(formData.params))
  curSelectPath.value = (await SfcUtils.request(API.resource.parseNodeId(formData.uid, formData.nid))).data.data
}

function initMountParamDefaultValue(desc: DiskFileSystemDescribe) {
  if (formData.protocol != desc.protocol) {
    // 切换协议清空所有挂载参数
    mountParam.value = reactive({})
  }

  desc.configNode.flatMap(e => e.nodes).forEach(node => {
    if (node) {
      if (mountParam.value[node.name]) {
        node.value = mountParam.value[node.name]
      } else {
        const paramValue = node.value ?? node.defaultValue
        mountParam.value[node.name] = paramValue
        node.value = paramValue
      }
    }
  })
  configGroup.value = desc.configNode
}

const formInst = defineForm({
  actions: {
    async getNodeIdByPath(path: string) {
      const res = await SfcUtils.request(API.resource.getNodeInfo(props.uid, path))
      return (res.data.data.pop()?.md5 || props.uid).toString()
    },
    selectPath() {
      SfcUtils.selectPath({
        uid: props.uid,
        path: '/',
        title: '选择挂载位置',
        filter(e) {
          return e.dir && !e.mountId
        }
      }).then(async(path) => {
        curSelectPath.value = path
        try {
          loadingRef.value = true
          formData.nid = await this.getNodeIdByPath(path)
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
              initMountParamDefaultValue(describe)
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
    },
    loadData() {
      return loadData()
    }
  },
  formData: reactive({
    uid: props.uid,
    protocol: '',
    name: '挂载点1',
    params: '{}',
    nid: props.uid,
    isProxyStoreRecord: false
  }) as MountPoint,
  formRef: formRef,
  validators: {
    protocol: [Validators.notNull('挂载协议不能为空')]
  },
  throwError: true
})
/**
 * 是否为编辑原有的挂载点
 */
const isEdit = ref<boolean>(false)
const { formData, actions, validators, loadingRef, loadingManager  } = formInst

async function loadData() {
  if(await actions.loadSystem()) {
    if (props.initValue) {
      isEdit.value = !!props.initValue.id
      await parseParams(props.initValue)
    } else if(await actions.loadById()) {
      emits('loaded', formData)
    }
  }
  // 加载默认路径
  if (props.path) {
    formData.nid = await actions.getNodeIdByPath(props.path)
    curSelectPath.value = props.path
  }
}

onMounted(async() => {
  try {
    await loadData()
  } catch(err) {
    emits('error', err)
    console.error(err)
  }
})
defineExpose(formInst)
watch(() => formData.protocol, (newVal, oldVal) => {
  if (newVal) {
    selectOptions.value.find(el => el.value == newVal)?.action?.()
  }
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted, watch } from 'vue'
import { reactive } from 'vue'
import ConfigurableForm from '../ConfigNode/ConfigurableForm.vue'
import { Validators } from 'sfc-common/core'

export default defineComponent({
  name: 'CreateMountPointForm'
})
</script>

<style lang="scss" scoped>
.form-divider {
  padding-bottom: 24px;
  margin: 0 auto;
}
</style>