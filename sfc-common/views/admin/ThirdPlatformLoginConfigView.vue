<template>
  <VCard class="ml-3 mr-3 mt-3" style="padding-top: 0; max-width: 1200px;">
    <VCardText>
      <LoadingMask :loading="loading" />
      <template v-if="configList?.length">
        <VTabs v-model="tab">
          <VTab
            v-for="item in configList"
            :key="item.platform.type"
            color="primary"
            :value="item.platform.type"
          >
            <CommonIcon :icon="item.platform.icon" /> {{ item.platform.type }}
          </VTab>
        </VTabs>
        <VWindow v-model="tab">
          <VWindowItem
            v-for="item in configList"
            :key="item.platform.type"
            :value="item.platform.type"
          >
            <ConfigurableForm
              :key="loadCount"
              :ref="(form) => setForm(item.platform.type, form)"
              style="max-width: 640px;"
              :show-change="true"
              :nodes="item.configNodeList"
              @change="configChange(item, $event)"
            />
          </VWindowItem>
        </VWindow>
      </template>
      <EmptyTip v-else-if="!loading" />
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
const loadCount = ref(0)
const CONTEXT_SOURCE = 'third_platform_login_config'
const props = defineProps({
  adminContext: {
    type: Object as PropType<AdminContext>,
    default: undefined
  }
})
type PlatformConfig = { platform: ThirdPartyAuthPlatform , configNodeList: ConfigNodeModel[] }

const formMap = {} as {[platformType: string]: CommonForm}
const setForm = (platformType: string, form: any) => {
  formMap[platformType] = form
}

const lm = new LoadingManager()
const loading = lm.getLoadingRef()

// 页面展示的配置信息列表
const configList = ref<PlatformConfig[]>()

// 当前选择的页签
const tab = ref<string>()

// 各平台配置信息map，key为平台类型
const platformConfigObjMap = reactive({}) as {[platformType: string]: any}

const originPlatformObjMap = reactive({}) as {[platformType: string]: ThirdPartyAuthPlatform}
const actions = MethodInterceptor.createAsyncActionProxy({
  // 加载配置项 和 配置值
  async loadData() {
    const res = await Promise.all([
      SfcUtils.request(API.oauth.getThirdPartyPlatformConfig()),
      SfcUtils.request(API.oauth.getThirdPartyPlatformConfigValue()),
    ])
    Object.keys(originPlatformObjMap).forEach(k => delete originPlatformObjMap[k])
    configList.value = Object.keys(res[1].data.data).map(type => {
      const platform = res[1].data.data[type]
      const configNodeList = res[0].data.data[type]
      const configValueObj = platform.config ? JSON.parse(platform.config) : reactive({})
      platformConfigObjMap[type] = configValueObj
      configNodeList.flatMap(e => e.nodes || [])
        .forEach(node => {
          node.value = configValueObj[node.name]
          node.originValue = configValueObj[node.name]
        })
      originPlatformObjMap[platform.type] = Object.assign({}, platform)
      return {
        platform,
        configNodeList: [
          {
            name: '通用',
            nodes: [
              {
                name: 'isEnable',
                inputType: 'switch',
                value: platform.isEnable || false,
                originValue: platform.isEnable || false,
                title: '是否启用',
                describe: '是否启用'
              } as ConfigNodeModel,
              {
                name: 'isAllowRegister',
                inputType: 'switch',
                value: platform.isAllowRegister || false,
                originValue: platform.isAllowRegister || false,
                title: '能否注册新用户',
                describe: '能否注册新用户'
              } as ConfigNodeModel,
              {
                name: 'proxyId',
                inputType: 'template',
                template: 'proxySelector',
                params: {
                  clearable: true,
                  refreshable: true,
                  onListLoaded(proxyList: ProxyInfo[]) {
                    // 代理列表加载完成后，构造代理id与名称的映射对象
                    // 实现在保存确认配置修改中，能显示代理名称而不是代理的id
                    const proxyConfigNode = configList.value?.find(e => e.platform.type == platform.type)?.configNodeList.flatMap(n => n.nodes || []).find(n => n.name == 'proxyId')
                    if (proxyConfigNode) {
                      proxyConfigNode.valueNameMapping = {}
                      for(const proxy of proxyList) {
                        proxyConfigNode.valueNameMapping[proxy.id] = proxy.name
                      }
                    }
                  }
                },
                title: '代理',
                value: platform.proxyId,
                originValue: platform.proxyId,
                describe: '服务器后台向第三方平台请求接口调用时，使用的代理',
                isRow: true,
                valueNameMapping: {}
              }
            ]
          } as ConfigNodeModel,
        ].concat(configNodeList)
      }
    })

    // 重置变更状态
    configList.value.forEach(c => {
      props.adminContext?.resetExtraNodeMap(getSourceName(c.platform.type))
    })
    loadCount.value++
  },
}, true, lm)

actions.loadData()

function getSourceName(platformType: string) {
  return `${CONTEXT_SOURCE}__` + platformType
}

/**
 * 配置参数变更回调
 * @param config 第三方平台配置对象
 * @param event 变更事件
 */
const configChange = (config: PlatformConfig, event: {name: string, value: any, node: ConfigNodeModel}) => {
  event.node.value = event.value
  let configValueObj = platformConfigObjMap[config.platform.type]
  if(!configValueObj) {
    configValueObj = reactive({})
    platformConfigObjMap[config.platform.type] = configValueObj
  }
  configValueObj[event.name] = event.value

  // 通知管理端视图配置发生变更
  const source = getSourceName(config.platform.type)
  props.adminContext?.changeConfig(source, event.node)
}

/**
 * 获取修改了的第三方平台配置
 */
function getChangePlatformList() {
  configList.value?.forEach(e => {
    e.platform.config = JSON.stringify(platformConfigObjMap[e.platform.type])
    // 通用属性写到单独字段上面
    e.platform.isEnable = platformConfigObjMap[e.platform.type].isEnable
    e.platform.isAllowRegister = platformConfigObjMap[e.platform.type].isAllowRegister
    e.platform.proxyId = platformConfigObjMap[e.platform.type].proxyId
  })
  return configList.value?.filter(e => {
    const origin = JSON.stringify(originPlatformObjMap[e.platform.type])
    const cur = JSON.stringify(e.platform)
    return origin != cur
  }).map(e => e.platform)
}

// 在管理端主页配置参数中注册保存前校验和保存执行方法
onMounted(() => {
  props.adminContext?.addBeforeSaveListener(CONTEXT_SOURCE, async() => {
    const platformChangeList = getChangePlatformList()
    if (!platformChangeList || platformChangeList.length == 0) {
      return
    }
    const validResultList = await Promise.allSettled(platformChangeList.filter(c => formMap[c.type]).map(c => formMap[c.type].validate()))
    if (!validResultList.some(res => res.status == 'rejected')) {
      return
    }

    const errorMsg = validResultList
      .map(res => {
        if (res.status == 'rejected') {
          return res.reason
        } else if (!res.value.valid) {
          return res.value.errors.map(e => e.errorMessages).join('; ')
        } else {
          return ''
        }
      })
      .join('; ')
    if (errorMsg) {
      return Promise.reject(errorMsg)
    } else {
      return
    }
  })
  props.adminContext?.addSaveListener(CONTEXT_SOURCE, async() => {
    const configChangeList = getChangePlatformList()

    if (!configChangeList?.length) {
      return
    }
    await SfcUtils.request(API.oauth.saveThirdPartyPlatformConfigValue(configChangeList))
    actions.loadData()
  })
})
onUnmounted(() => {
  props.adminContext?.removeAllListener(CONTEXT_SOURCE)
})
</script>

<script lang="ts">
import API from 'sfc-common/api'
import { CommonIcon, EmptyTip, LoadingMask } from 'sfc-common/components'
import ConfigurableForm from 'sfc-common/components/common/ConfigNode/ConfigurableForm.vue'
import { AdminContext } from 'sfc-common/core'
import { ConfigNodeModel, ProxyInfo } from 'sfc-common/model'
import { ThirdPartyAuthPlatform } from 'sfc-common/model/Oauth'
import { CommonForm, LoadingManager, MethodInterceptor } from 'sfc-common/utils'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { defineComponent, ref, PropType, reactive, onMounted, onUnmounted } from 'vue'

export default defineComponent({
  name: 'ThirdPlatformLoginConfigView'
})
</script>