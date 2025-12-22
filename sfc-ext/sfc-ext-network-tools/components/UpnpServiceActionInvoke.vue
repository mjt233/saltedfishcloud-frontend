<template>
  <div>
    <LoadingMask :loading="isLoading" />
    <FormSelect
      v-model="curAction"
      :items="serviceActions"
      label="UPnP服务方法"
      @change="actionChange"
    />
    <div class="mt-2">
      <template v-for="arg in curArgs" :key="arg.name">
        <div v-if="arg.direction == 'in'">
          <VCheckbox
            v-if="arg.variableRef?.dataType == 'boolean'"
            v-model="curArgsValue[arg.name]"
            :label="arg.name"
            color="primary"
          />
          <FormSelect
            v-else-if="arg.variableRef?.allowedValueList"
            v-model="curArgsValue[arg.name]"
            :items="arg.variableRef.allowedValueList.map(e => { return { title: e, value: e } } )"
            :label="arg.name"
            @change="curArgsValue[arg.name] = $event.value"
          />
          <TextInput v-else v-model="curArgsValue[arg.name]" :label="arg.name" />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  device: {
    type: Object as PropType<Upnp.UpnpDevice>,
    default: undefined
  },
  service: {
    type: Object as PropType<Upnp.Service>,
    default: undefined
  }
})
const SfcUtils = window.SfcUtils
const lm = new LoadingManager()
const isLoading = lm.getLoadingRef()

let serviceActions = ref() as Ref<SelectOption[]>
let curAction = ref('') as Ref<string>
let curArgs = ref([]) as Ref<Upnp.Argument[]>
let curArgsValue = reactive({}) as { [k: string]: string | boolean}
let scpd: Upnp.Scpd

const methods = MethodInterceptor.createAsyncActionProxy({
  /**
   * 加载服务描述定义信息
   */
  async loadScpd() {
    if (!props.device || !props.service?.serviceType) {
      return Promise.reject('缺少设备udn/usn 或 服务serviceType')
    }
    // 加载scpd原始数据，并给每个参数匹配对应参数变量信息
    scpd = (await SfcUtils.request(NwtApi.UPnP.getUpnpServiceScpd(props.device.describe.device.udn, props.service.serviceType))).data.data
    const variableRefMap = {} as { [k: string]: Upnp.StateVariable }
    scpd.serviceStateTable.forEach(t => { variableRefMap[t.name] = t })
    scpd.actionList.flatMap(act => act.argumentList)
      .filter(e => e)
      .forEach(arg => arg.variableRef = variableRefMap[arg.relatedStateVariable])

    serviceActions.value = scpd.actionList.map(e => {
      return {
        title: e.name,
        value: e.name,
        actionObj: e
      }
    })
    curAction.value = serviceActions.value[0].value
  },

  async invokeUpnpService() {
    const res = (await SfcUtils.request(NwtApi.UPnP.invokeUpnpService({
      rootDeviceUSN: props.device?.describe.device.udn as string,
      action: curAction.value,
      serviceType: props.service?.serviceType as string,
      actionParams: Object.keys(curArgsValue).map(k => {
        return {
          key: k,
          value: curArgsValue[k] as string
        }
      })
    }))).data.data

    SfcUtils.alert(res.responseBody, res.statusCode == 200 ? '调用成功' : '调用失败')
    return res
  }
}, true, lm)

/**
 * 切换service动作回调，更新参数列表并设置参数默认值
 * @param action 切换的service动作
 */
function actionChange(action: SelectOption & { actionObj: Upnp.Action }) {
  curArgs.value = action.actionObj.argumentList || []
  Object.keys(curArgsValue).forEach(k => delete curArgsValue[k] )
  curArgs.value.filter(arg => arg.variableRef?.defaultValue !== undefined && arg.variableRef.defaultValue !== null)
    .forEach(arg => {
      let defVal: string | boolean = curArgsValue[arg.name] = arg.variableRef?.defaultValue as string
      if (arg.variableRef?.dataType == 'boolean') {
        defVal = (defVal == 'true')
      }
      curArgsValue[arg.name] = defVal
    })
}

function getParams() {
  return Object.assign({}, curArgsValue)
}

onMounted(() => methods.loadScpd())

defineExpose({
  getParams,
  invokeUpnpService: methods.invokeUpnpService
})
</script>

<script lang="ts">

import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, computed, onMounted, reactive } from 'vue'
import { Upnp } from '../model'
import { LoadingManager, MethodInterceptor, SelectOption } from 'sfc-common'
import { NwtApi } from '../api'

export default defineComponent({
  name: 'UpnpServiceActionInvoke'
})
</script>