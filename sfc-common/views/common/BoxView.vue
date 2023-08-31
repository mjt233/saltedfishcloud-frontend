<template>
  <div style="padding-top: 0">
    <div class="tool-bar d-flex align-center" :class="{active: inActive == '1'}">
      <v-btn
        size="small"
        icon="mdi-arrow-left"
        style="background: transparent;"
        flat
        @click="menuContext.currentComponent = undefined; $router.replace('/box')"
      />
      {{ menuContext.title }}
    </div>
    <v-window :model-value="inActive">
      <v-window-item value="0">
        <grid-menu :items="context.menu.value.boxMenu" :arg-provider="argProvider" @click="itemClick" />
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
import { AppContext, BoxMenuContext, context, MenuGroup, MenuItem } from 'sfc-common/core/context'
import GridMenu from 'sfc-common/components/common/GridMenu.vue'
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
const itemClick = (e: MenuItem<BoxMenuContext>) => {
  context.routeInfo.value.router?.push('/box/' + e.id)
}

onMounted(() => {
  // 根据当前路由信息判断是否是某个菜单功能的路由，如果是则执行对应的菜单方法
  const itemId = context.routeInfo.value.curr?.params.itemId
  if (itemId) {
    const boxMenu = context.menu.value.boxMenu.flatMap(e => e.items).find(e => e.id == itemId)
    boxMenu?.action && boxMenu?.action(menuContext)
  }
})
</script>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive } from 'vue'
import { ArgumentProvider } from 'sfc-common/model/component/GridMenuModel'

export default defineComponent({
  name: 'BoxView'
})
</script>

<style lang="scss" scoped>
.tool-bar {
  position: relative;
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