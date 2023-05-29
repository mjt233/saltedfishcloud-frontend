<template>
  <v-snackbar
    v-model="active"
    :timeout="timeout"
    @mouseover="stopTimeout"
    @mouseleave="startTimeout"
  >
    <span class="break-text text"> {{ text }}</span>
    <template v-if="showClose" #actions>
      <v-btn color="red" @click="doClose">
        CLOSE
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
const emit = defineEmits(['close'])

const props = defineProps({
  text: {
    type: String,
    default: ''
  },
  showClose: {
    type: Boolean,
    default: false
  },
  timeout: {
    type: Number,
    default: 2000
  },
  /**
   * 控制点击气泡框外部区域时是否关闭气泡，默认为false，false为不关闭
   */
  outClose: {
    type: Boolean,
    default: false
  }
})

const active = ref(true)
const closeSnackBar = (e: MouseEvent) => {
  if(props.outClose  && !DOMUtils.getElParentByClass(e.target as HTMLElement, 'v-overlay-container')) {
    active.value = false
    emitClose()
  }
}

const emitClose = () => {
  setTimeout(() => {
    emit('close')
  }, 200)
  document.removeEventListener('click', closeSnackBar)
}
/**
 * 自动消失timeout计时器
 */
let time: any = null
const startTimeout = () => {

  time = setTimeout(() => {
    active.value = false
    emitClose()
  }, props.timeout)
}

startTimeout()

const doClose = () => {
  active.value = false
  emitClose()
  clearTimeout(time)
}

const stopTimeout = () => {
  clearTimeout(time)
}

onMounted(() => {
  setTimeout(() => {
    document.addEventListener('click', closeSnackBar)
  }, 0)
})
</script>

<script lang="ts">
import { defineComponent, ref, defineProps, defineEmits, onMounted, getCurrentInstance, nextTick } from 'vue'
import DOMUtils from 'sfc-common/utils/DOMUtils'
export default defineComponent({
  name: 'SnackBar'
})
</script>



<style scoped>
.text {
  color: white;
}
</style>