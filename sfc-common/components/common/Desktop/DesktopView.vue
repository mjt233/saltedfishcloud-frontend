<template>
  <div class="desktop-view">
    <LoadingMask :loading="loading" />
    <template v-if="configItems && configItems.length">
      <VContainer fluid>
        <VRow>
          <VCol
            v-for="item in configItems"
            :key="item.id"
            :cols="item.width"
            class="component-container"
          >
            <template v-if="item.useCard">
              <VCard>
                <template v-if="item.title?.length" #title>
                  <div style="padding-bottom: 0px">
                    {{ item.title }}
                  </div>
                </template>
                <VCardText>
                  <component
                    :is="item.name"
                    class="desktop-component"
                    v-bind="getComponentProps(item)"
                    :style="getComponentStyle(item)"
                  />
                </VCardText>
              </VCard>
            </template>
            <component
              :is="item.name"
              v-else
              class="desktop-component"
              v-bind="getComponentProps(item)"
              :style="getComponentStyle(item)"
            />
          </VCol>
        </VRow>
      </VContainer>
    </template>
    <div v-else>
      <EmptyTip v-if="isEmpty">
        <template v-if="hasLogin && ((uid == 0 && isAdmin) || uid != 0)" #append>
          请 <a class="link" @click="gotoConfigure(false)">前往配置桌面</a> 或 <a class="link" @click="gotoConfigure(true)">快速配置</a>
        </template>
      </EmptyTip>
    </div>
  </div>
</template>

<script setup lang="ts">
const isEmpty = ref(false)
const loadingManager = new LoadingManager()
const loading = loadingManager.getLoadingRef()
const configItems = ref<DesktopComponentConfig[]>([])
const props = defineProps({
  uid: {
    type: [String, Number],
    default: 0
  }
})
const actions = MethodInterceptor.createAsyncActionProxy({
  async loadComponentConfig() {
    configItems.value = (await SfcUtils.request(API.desktop.listComponentConfig(props.uid))).data.data
    if (configItems.value?.length) {
      isEmpty.value = configItems.value.findIndex(e => e.enabled == 1) == -1
      configItems.value = configItems.value.filter(e => e.enabled)
    } else {
      isEmpty.value = true
    }
  }
}, false, loadingManager)


const getComponentProps = (item: DesktopComponentConfig) => {
  const baseObj = JSON.parse(item.params || '{}')
  baseObj.desktopComponentConfig = item
  return baseObj
}

const hasLogin = computed(() => ConditionFunction.hasLogin(context))
const isAdmin = computed(() => ConditionFunction.isAdmin(context))

const gotoConfigure = (isQuick?: boolean) => {
  if (isQuick) {
    SfcUtils.openComponentDialog(DesktopConfigList, {
      props: {
        uid: props.uid,
        style: {
          minHeight: '60vh'
        }
      },
      title: '快速配置桌面',
      extraDialogOptions: {
        maxWidth: '90vw',
        width: '100%',
      },
      showCancel: false,
      onConfirm() {
        actions.loadComponentConfig()
        return true
      },
    })
  } else {
    let path
    if (props.uid == 0) {
      path = '/admin/sys/desktop'
    } else {
      path = '/box/desktop'
    }
    context.routeInfo.value.router?.push({
      path
    })
  }
}

const getComponentStyle = (item: DesktopComponentConfig) => {
  if (item.height < 0) {
    return {}
  } else {
    return {
      height: (document.body.clientHeight / 5) * item.height + 'px'
    }
  }
}

onMounted(actions.loadComponentConfig)
</script>

<script lang="ts">
import API from 'sfc-common/api'
import { ConditionFunction, context } from 'sfc-common/core'
import { DesktopComponentConfig } from 'sfc-common/model/Desktop'
import { LoadingManager } from 'sfc-common/utils/LoadingManager'
import { MethodInterceptor } from 'sfc-common/utils/MethodInterceptor'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { computed } from 'vue'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted } from 'vue'
import DesktopConfigList from './DesktopConfigList.vue'

export default defineComponent({
  name: 'DesktopView'
})
</script>

<style>
.component-container {
  min-width: 320px;
}
.desktop-component {
  width: 100%;
}
.desktop-view {
  position: relative;
  min-height: 32px;
}
</style>