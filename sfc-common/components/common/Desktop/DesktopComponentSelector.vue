<template>
  <div>
    <LoadingMask :loading="loading" />
    <GridContainer v-if="componentList && componentList.length" type="evenly" :width="210">
      <div
        v-for="item in componentList"
        :key="item.name"
        v-ripple
        class="component-item"
        @click="emits('select', item)"
      >
        <div class="d-flex align-center">
          <div style="padding: 6px">
            <CommonIcon color="primary" style="font-size: 18px" :icon="item.icon" />
          </div>
          <div>
            <div>{{ item.title }}</div>
            <div class="tip">
              {{ item.describe }}
            </div>
          </div>
        </div>
      </div> 
    </GridContainer>
    <EmptyTip v-else />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  /** 桌面所属用户ID，0表示公共桌面，非0表示我的桌面 */
  uid: {
    type: [String, Number],
    default: 0
  }
})
const loadingManager = new LoadingManager()
const loading = loadingManager.getLoadingRef()
const emits = defineEmits(['select'])
const componentList = ref([]) as Ref<DesktopComponent[]>
const actions = MethodInterceptor.createAsyncActionProxy({
  async loadList() {
    const ret = (await SfcUtils.request(API.desktop.listAllComponent())).data.data
    // 根据 scope 字段过滤：uid=0（公共桌面）只显示 scope 为 'public' 或 'all' 的组件；
    // uid!=0（我的桌面）只显示 scope 为 'private' 或 'all' 的组件；scope 为 null/undefined 时视为 'all'
    const isPublic = props.uid === 0 || props.uid === '0'
    componentList.value = ret.filter((item: DesktopComponent) => {
      const scope = item.scope ?? 'all'
      if (isPublic) {
        return scope === 'public' || scope === 'all'
      } else {
        return scope === 'private' || scope === 'all'
      }
    })
  }
},false,loadingManager)
onMounted(actions.loadList)
</script>

<script lang="ts">
import API from 'sfc-common/api'
import { DesktopComponent } from 'sfc-common/model/Desktop'
import { LoadingManager } from 'sfc-common/utils/LoadingManager'
import { MethodInterceptor } from 'sfc-common/utils/MethodInterceptor'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted } from 'vue'

export default defineComponent({
  name: 'DesktopComponentSelector'
})
</script>

<style scoped lang="scss">
.component-item {
  display: inline-block;
  width: 210px;
  padding: 6px;
  transition: all .2s;
  cursor: pointer;
  border-radius: 5px;
  &:hover {
    background-color: rgba(var(--v-theme-primary), .1);
  }
}
</style>