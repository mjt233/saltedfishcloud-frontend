<template>
  <v-snackbar
    v-model="active"
    :timeout="timeout"
    @mouseover="stopTimeout"
    @mouseleave="startTimeout"
  >
    {{ text }}
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
  }
})

const active = ref(true)
const emitClose = () => {
  setTimeout(() => {
    emit('close')
  }, 200)
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
</script>

<script lang="ts">
import { defineComponent, ref, defineProps, defineEmits } from 'vue'

export default defineComponent({
  name: 'SnackBar'
})
</script>