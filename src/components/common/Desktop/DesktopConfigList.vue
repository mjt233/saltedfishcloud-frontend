<template>
  <div style="padding: 6px 0">
    <LoadingMask :loading="loadingRef" />
    <VBtn color="primary" @click="addComponent">
      <v-icon>mdi-plus</v-icon>
      添加组件
    </VBtn>
    <div>
      <template v-if="configItems && configItems.length">
        <div
          v-for="item in configItems"
          :key="item.id"
          v-ripple
          class="d-inline-flex align-center component-item"
          :class="{'disabled': !item.enabled}"
          @click="addOrEditConfig(allComponent[item.name], item)"
        >
          <div class="d-flex justify-center align-center flex-column">
            <CommonIcon :color="item.enabled ? 'primary' : undefined" style="font-size: 18px;padding: 3px" :icon="allComponent[item.name]?.icon || 'mdi-help-circle-outline'" />
            <div @click.stop>
              <VSwitch
                :model-value="item.enabled"
                :loading="enableSwitchLoading[item.id]"
                :density="null"
                hide-details
                :color="!enableSwitchLoading[item.id] ? 'primary' : undefined"
                :true-value="1"
                :false-value="0"
                class="enabled-switcher"
                @update:model-value="enabledChange(item, $event)"
              />
            </div>
          </div>
          <div>
            <div>
              <span>{{ allComponent[item.name]?.title || '未知组件' }}</span>
              <span v-if="item?.title?.length">({{ item.title }})</span>
            </div>
            <div class="tip">
              {{ allComponent[item.name]?.describe }}<br>
              备注：{{ item.remark || '无' }}
            </div>
          </div>
          <VSpacer />
          <div style="width: 32px">
            <CommonIcon class="delete-btn" icon="mdi-close" @click.stop="confirmDelete(item.id)" />
          </div>
        </div>
      </template>
      <EmptyTip v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
const loading = new LoadingManager()
const loadingRef = loading.getLoadingRef()
const props = defineProps({
  uid: {
    type: [String, Number],
    default: 0
  }
})
const configItems = ref<DesktopComponentConfig[]>([])
const allComponent = reactive({} as {[name:string]: DesktopComponent})
const actions = MethodInterceptor.createAsyncActionProxy({
  async loadConfig() {
    configItems.value = (await SfcUtils.request(API.desktop.listComponentConfig(props.uid))).data.data;
    (await SfcUtils.request(API.desktop.listAllComponent())).data.data.forEach(component => {
      allComponent[component.name] = component
    })
  },
  async deleteConfig(id: IdType) {
    return await SfcUtils.request(API.desktop.deleteConfig(id))
  }
}, false, loading)

const enableSwitchLoading: {[k:IdType]: boolean | undefined} = reactive({})

/**
 * 组件启用状态变更回调
 * @param config 组件配置
 * @param newVal 更改后的值
 */
const enabledChange = async(config: DesktopComponentConfig, newVal: number) => {
  if(enableSwitchLoading[config.id]) {
    return
  }
  enableSwitchLoading[config.id] = true
  try {
    const saveObj:DesktopComponentConfig = {...config}
    saveObj.enabled = newVal
    await SfcUtils.request(API.desktop.saveComponentConfig(saveObj))
    config.enabled = newVal
  } catch (err) {
    SfcUtils.snackbar(err)
  } finally {
    enableSwitchLoading[config.id] = false
  }
}

const addComponent = () => {
  const inst = SfcUtils.openComponentDialog(DesktopComponentSelector, {
    title: '选择组件',
    props: {
      async onSelect(e: DesktopComponent) {
        inst.doCancel()
        await SfcUtils.sleep(150)
        addOrEditConfig(e)
      }
    },
    showConfirm: false
  })
}

const addOrEditConfig = (component: DesktopComponent, config?: DesktopComponentConfig) => {
  const inst = SfcUtils.openComponentDialog(DesktopConfigForm, {
    props: {
      component,
      initValue: config,
      uid: props.uid
    },
    title: !config ? '新增小组件' : '编辑小组件',
    async onConfirm() {
      const ret = await inst.getInstAsForm().submit()
      if (ret.success) {
        actions.loadConfig()
        return true
      } else {
        return false
      }
    }
  })
}

const confirmDelete =  async(id: IdType) => {
  await SfcUtils.confirm('确定要删除这个组件配置吗？', '删除确认')
  await actions.deleteConfig(id)
  SfcUtils.snackbar('删除成功')
  actions.loadConfig()
  
}

onMounted(actions.loadConfig)
</script>

<script lang="ts">
import API from '@/api'
import { IdType } from '@/core/model'
import { DesktopComponent, DesktopComponentConfig } from '@/core/model/Desktop'
import { LoadingManager } from '@/utils/LoadingManager'
import { MethodInterceptor } from '@/utils/MethodInterceptor'
import SfcUtils from '@/utils/SfcUtils'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted, reactive, watch } from 'vue'
import DesktopComponentSelector from './DesktopComponentSelector.vue'
import DesktopConfigForm from './DesktopConfigForm.vue'

export default defineComponent({
  name: 'DesktopConfigList'
})
</script>

<style lang="scss" scoped>
.component-item {
  display: inline-block;
  width: 360px;
  max-width: 100%;
  padding: 6px;
  margin: 12px 12px 0 0;
  transition: all .2s;
  border-radius: 5px;
  cursor: pointer;
  border: 1px solid rgba(var(--v-theme-primary), .2);
  &:hover {
    background-color: rgba(var(--v-theme-primary), .05);
  }

  &.disabled {
    background-color: rgba(var(--v-theme-info), .05);
    border-color: rgba(var(--v-theme-info), .05);
  }
}

.enabled-switcher {
  margin: 3px 12px;
}

.delete-btn {
  transition: all .2s;
  &:hover {
    color: rgb(var(--v-theme-error));
  }
}
</style>