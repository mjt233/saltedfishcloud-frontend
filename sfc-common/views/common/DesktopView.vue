<template>
  <div style="margin-left: 18px">
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
                <VCardHeader v-if="item.title?.length" style="padding-bottom: 0px">
                  <VCardTitle>{{ item.title }}</VCardTitle>
                </VCardHeader>
                <VCardContent>
                  <component
                    :is="item.name"
                    class="desktop-component"
                    v-bind="getComponentProps(item)"
                    :style="getComponentStyle(item)"
                  />
                </VCardContent>
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
    <EmptyTip v-else />
  </div>
</template>

<script setup lang="ts">
const loadingManager = new LoadingManager()
const loading = loadingManager.getLoadingRef()
const configItems = ref<DesktopComponentConfig[]>([])
const actions = MethodInterceptor.createAsyncActionProxy({
  async loadComponentConfig() {
    configItems.value = (await SfcUtils.request(API.desktop.listComponentConfig(0))).data.data
    if (configItems.value?.length) {
      configItems.value = configItems.value.filter(e => e.enabled)
    }
  }
}, false, loadingManager)


const getComponentProps = (item: DesktopComponentConfig) => {
  const baseObj = JSON.parse(item.params || '{}')
  baseObj.desktopComponentConfig = item
  return baseObj
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
import { DesktopComponentConfig } from 'sfc-common/model/Desktop'
import { LoadingManager } from 'sfc-common/utils/LoadingManager'
import { MethodInterceptor } from 'sfc-common/utils/MethodInterceptor'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted } from 'vue'

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
</style>