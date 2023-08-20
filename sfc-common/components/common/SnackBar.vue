<template>
  <teleport :to="teleportTo">
    <div class="custom-snackbar" :class="{leave: !active, enter: isEnter}">
      <div
        class="custom-snackbar-content elevation-8"
        @mouseover="stopTimeout"
        @mouseleave="startTimeout"
      >
        <div class="break-text text">
          {{ text }}
        </div>
        <template v-if="showClose">
          <v-btn variant="plain" @click="doClose">
            <span class="text-red">CLOSE</span>
          </v-btn>
        </template>
      </div>
    </div>
  </teleport>
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
  },
  teleportTo: {
    type: String,
    default: '.body-snackbar-container'
  }
})
const isEnter = ref(true)
const active = ref(true)
const closeSnackBar = (e: MouseEvent) => {
  if(props.outClose  && !DOMUtils.getElParentByClass(e.target as HTMLElement, 'custom-snackbar')) {
    doClose()
  }
}

const emitClose = () => {
  setTimeout(() => {
    emit('close')
  }, 250)
  document.removeEventListener('click', closeSnackBar)
}
/**
 * 自动消失timeout计时器
 */
let time: any = null
const startTimeout = () => {
  time = setTimeout(() => doClose() , props.timeout)
}


const doClose = () => {
  active.value = false
  emitClose()
  clearTimeout(time)
}

const stopTimeout = () => {
  clearTimeout(time)
}

onMounted(async() => {
  await SfcUtils.sleep(250)
  isEnter.value = false
  startTimeout()
})

onMounted(() => {
  setTimeout(() => {
    document.addEventListener('click', closeSnackBar)
  }, 0)
})
</script>

<script lang="ts">
import { defineComponent, ref, defineProps, defineEmits, onMounted, getCurrentInstance, nextTick } from 'vue'
import DOMUtils from 'sfc-common/utils/DOMUtils'
import SfcUtils from 'sfc-common/utils/SfcUtils'
export default defineComponent({
  name: 'SnackBar'
})
</script>



<style scoped lang="scss">
.text {
  color: #fff;
  padding: 12px;
}

.custom-snackbar-content {
  background-color: #333333;
  border-radius: 4px;
  margin: 6px 0;
  display: inline-flex;
  min-width: 280px;
  position: relative;
  font-size: 14px;
  left: 50%;
  transform: translateX(-50%);
  justify-content: space-between;
  align-items: center;
}

.custom-snackbar {
  &.enter {
    animation: up-in .2s;
  }
  
  &.leave {
    animation: up-in .2s;
    animation-direction: reverse;
    opacity: 0;
  }
}
</style>