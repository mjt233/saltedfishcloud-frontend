<template>
  <div class="fixed-btn" :class="{hide:hide}">
    <v-btn
      :icon="icon"
      :color="color"
      @click="emits('click')"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  hide: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: 'mdi-check'
  },
  color: {
    type: String,
    default: 'primary'
  }
})

const emits = defineEmits(['click'])
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'

export default defineComponent({
  name: 'FixedBtn'
})
</script>

<style lang="scss" scoped>
.fixed-btn {
  position: fixed;
  bottom: 32px;
  right: 32px;
  transition: all .1s;
  &.hide {
    opacity: 0;
    pointer-events: none;
    transform: scale(0);
  }
}
</style>