<template>
  <div ref="rootRef" class="box-view">
    <div v-for="group in availableItems" :key="group.id" class="item-group">
      <div class="text-subtitle-1">
        {{ group.name }}
      </div>
      <v-divider />
      <grid-container
        type="between"
        :width="boxSize"
        :gap="'0px'"
      >
        <template v-for="(item, index) in group.items" :key="item.id">
          <div
            v-if="item.renderOn ? item.renderOn(context) : true"
            v-ripple
            class="grid-item"
            @click="itemClick(item, index)"
          >
            <div class="grid-item-icon">
              <v-icon>
                {{ item.icon || 'mdi-puzzle' }}
              </v-icon>
            </div>
            <div class="grid-item-title text-shade">
              {{ item.title }}
            </div>
            
          </div>
        </template>
      </grid-container>
    </div>
  </div>
</template>

<script setup lang="ts">
import GridContainer from '@/components/layout/GridContainer.vue'
import { AppContext, MenuGroup, context, MenuItem } from '@/core/context'
import { ArgumentProvider } from '@/core/model/component/GridMenuModel'
import SfcUtils from '@/utils/SfcUtils'
const props = defineProps({
  items: {
    type: Array as PropType<MenuGroup<any>[]>,
    default: () => []
  },
  argProvider: {
    type: Object as PropType<ArgumentProvider<any>>,
    default: () => {
      return { getArgument: () => undefined }
    }
  }
})
const availableItems = computed(() => {
  return props.items.filter(e => e.renderOn ? e.renderOn(context) : true)
})
const boxSize = ref(120)
const boxSizePx = computed(() => {
  return boxSize.value + 'px'
})
const boxIconSize = computed(() => {
  return boxSize.value / 4 + 'px'
})
const rootRef = ref() as Ref<HTMLElement>
const updateSize = () => {
  const el = rootRef.value as HTMLElement
  if (!el) {
    return
  }
  if (el.clientWidth < 480) {
    boxSize.value = 96
  } else {
    boxSize.value = 120
  }
}
const itemClick = (item: MenuItem<any>, index: number) => {
  if (item.action) {
    try {
      const arg = props.argProvider.getArgument(index, item)
      item.action(arg)
    } catch (err) {
      console.error(err)
      SfcUtils.snackbar(err)
    }
  } else {
    SfcUtils.snackbar('功能未实现')
  }
}

onMounted(() => {
  setTimeout(() => {
    
    updateSize()
    window.addEventListener('resize', updateSize)
  }, 200)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateSize)
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, computed, ToRefs, ComponentPublicInstance, onMounted, onUnmounted, nextTick } from 'vue'

export default defineComponent({
  name: 'GridMenu'
})
</script>

<style lang="scss" scoped>
.box-view {
  padding: 12px;
}
.item-group>* {
  margin: 6px 0;
}

.grid-item {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: v-bind(boxSizePx);
  transition: all .1s;
  &:hover {
    background-color: rgba(black, .08);
  }
  &>.grid-item-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    height: var(100% - v-bind(boxSizePx));
    font-size: v-bind(boxIconSize);
    color: rgb(var(--v-theme-primary));
    height: 60%;
    // background-color: blue;
  }
  &>.grid-item-title {
    font-size: 12px;
    text-align: center;
    width: 100%;
    height: 40%;
    margin-top: 6px;
  }
}
</style>