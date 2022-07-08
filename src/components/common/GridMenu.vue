<template>
  <div class="box-view">
    <div v-for="group in availableItems" :key="group.id" class="item-group">
      <div class="text-subtitle-1">
        {{ group.name }}
      </div>
      <v-divider />
      <grid-container type="between" :width="boxSize" style="margin-top: 6px">
        <template v-for="item in group.items" :key="item.id">
          <div v-if="item.renderOn ? item.renderOn(context) : true" v-ripple class="grid-item">
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
import { AppContext, MenuGroup, context } from '@/core/context'
const defaultBoxItems: MenuGroup<ToRefs<AppContext>>[] = [
  {
    id: 'shareAndCollection',
    name: '分享与收集',
    items: []
  }
]
const props = defineProps({
  items: {
    type: Array as PropType<MenuGroup<ToRefs<AppContext>>[]>,
    default: () => {
      return [
      ]
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
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, computed, ToRefs } from 'vue'

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