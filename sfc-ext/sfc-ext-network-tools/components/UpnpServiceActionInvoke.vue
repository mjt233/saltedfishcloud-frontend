<template>
  <div>
    <LoadingMask :loading="isLoading" />
    <div class="tip">
      <div>设备: {{ device?.describe.device.friendlyName }}</div>
      <div>服务: {{ service?.serviceType }}</div>
    </div>
    <VDivider class="mt-2 mb-2" />
    <VForm ref="formRef">
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
              clearable
            />
            <TextInput
              v-else
              v-model="curArgsValue[arg.name]"
              :label="arg.name"
              :rules="getArgRules(arg)"
            />
          </div>
        </template>
      </div>
    </VForm>
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
const formRef: Ref<any> = ref()

let serviceActions = ref() as Ref<SelectOption[]>
let curAction = ref('') as Ref<string>
let curArgs = ref([]) as Ref<Upnp.Argument[]>
let curArgsValue = reactive({}) as { [k: string]: string | boolean}
let scpd: Upnp.Scpd


/**
 * 获取 UPnP 服务方法的参数校验数组
 * @param arg 参数定义
 */
function getArgRules(arg: Upnp.Argument): ValidateRule[] {
  // 缺少参数变量参考的不校验
  if (!arg.variableRef) {
    return []
  }

  // 非数字类型的不校验
  if (arg.variableRef.dataType != 'i4' && arg.variableRef.dataType != 'ui4') {
    return []
  }

  const max = arg.variableRef.allowedValueRange?.maximum
  const min = arg.variableRef.allowedValueRange?.minimum
  const step = arg.variableRef.allowedValueRange?.step === undefined ? 1 : arg.variableRef.allowedValueRange.step
  return [
    val => {
      // 空不校验
      if (val === null || val === undefined || val === '') {
        return true
      }
      if (max !== undefined && val > max) {
        return arg.name + '不能大于' + max
      }
      if (min !== undefined && val < min) {
        return arg.name + '不能小于' + min
      }
      if (new String(val).indexOf('.') != -1) {
        return arg.name + '不能是小数'
      }
      const numVal = parseInt(val)
      if (numVal != val) {
        return arg.name + '只能输入数字'
      }
      if (step && numVal % step != 0) {
        return arg.name + '只能是' + step + '的整数倍'
      }
      return true
    }
  ]
}

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
    const validRes = (await formRef.value.validate()) as ValidateResult
    console.log(validRes)
    if (!validRes.valid) {
      const msg = validRes.errors.map(e => e.errorMessages).join('. ')
      return Promise.reject(msg)
    }
    const res = (await SfcUtils.request(NwtApi.UPnP.invokeUpnpService({
      rootDeviceUSN: props.device?.describe.device.udn as string,
      action: curAction.value,
      serviceType: props.service?.serviceType as string,
      actionParams: curArgs.value
        .filter(e => e.direction == 'in')
        .map(arg => {
          const val = curArgsValue[arg.name] as string
          return {
            key: arg.name,
            value: (val === undefined || val === null) ? '' : val
          }
        })
    }))).data.data

    const isOK = res.statusCode == 200
    SfcUtils.dialog({
      title: curAction.value,
      onCancel: () => true,
      onConfirm: () => true,
      children: () => [
        h('p', { style: { color: isOK ? 'green' : 'red' } }, isOK ? '✔调用成功' : '❌调用失败'),
        h('p', { class: 'tip mt-2 mb-2' },'接口响应'),
        h('code', res.responseBody)
      ],
      extraProps: {
        showConfirm: false,
        cancelText: '关闭'
      }
    })
    // SfcUtils.alert(res.responseBody, )
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

import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, computed, onMounted, reactive, ComponentInstance, h } from 'vue'
import { Upnp } from '../model'
import { LoadingManager, MethodInterceptor, SelectOption, ValidateResult } from 'sfc-common'
import { NwtApi } from '../api'
import type { ValidateRule } from 'sfc-common/model/component/type'

export default defineComponent({
  name: 'UpnpServiceActionInvoke'
})
</script>