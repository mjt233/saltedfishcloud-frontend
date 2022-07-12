<template>
  <div style="padding-top: 0">
    <div class="tool-bar d-flex align-center" :class="{active: inActive == '1'}">
      <v-btn
        size="small"
        icon="mdi-arrow-left"
        flat
        @click="menuContext.currentComponent = undefined"
      />
      {{ menuContext.title }}
    </div>
    <v-window :model-value="inActive">
      <v-window-item value="0">
        <grid-menu :items="context.menu.value.boxMenu" :arg-provider="argProvider" />
      </v-window-item>
      <v-window-item value="1">
        <div style="padding: 0 16px">
          <component :is="menuContext.currentComponent" v-if="menuContext.currentComponent" />
        </div>
      </v-window-item>
    </v-window>
    
  </div>
</template>

<script setup lang="ts">
import { AppContext, BoxMenuContext, context, MenuGroup } from '@/core/context'
import GridMenu from '@/components/common/GridMenu.vue'
const menuContext: BoxMenuContext = reactive({
  currentComponent: undefined,
  title: ''
})
const argProvider: ArgumentProvider<BoxMenuContext> = {
  getArgument(index, id) {
    return menuContext
  }
}
const inActive = computed(() => {
  return menuContext.currentComponent ? '1' : '0'
})
</script>

<script lang="ts">
import { computed, defineComponent, reactive } from 'vue'
import { ArgumentProvider } from '@/core/model/component/GridMenuModel'

export default defineComponent({
  name: 'BoxView'
})
</script>

<style lang="scss" scoped>
.tool-bar {
  height: 0px;
  opacity: 0;
  transition: all .2s;
  &.active {
    opacity: 1;
    height: 64px;
    padding: 0 6px;
  }
}
</style>