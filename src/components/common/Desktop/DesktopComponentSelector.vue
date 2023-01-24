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
const loadingManager = new LoadingManager()
const loading = loadingManager.getLoadingRef()
const emits = defineEmits(['select'])
const componentList = ref([]) as Ref<DesktopComponent[]>
const actions = MethodInterceptor.createAsyncActionProxy({
  async loadList() {
    const ret = (await SfcUtils.request(API.desktop.listAllComponent())).data.data
    componentList.value = ret
  }
},false,loadingManager)
onMounted(actions.loadList)
</script>

<script lang="ts">
import API from '@/api'
import { DesktopComponent } from '@/core/model/Desktop'
import { LoadingManager } from '@/utils/LoadingManager'
import { MethodInterceptor } from '@/utils/MethodInterceptor'
import SfcUtils from '@/utils/SfcUtils'
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