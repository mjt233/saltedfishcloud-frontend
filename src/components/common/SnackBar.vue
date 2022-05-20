<template>
  <v-snackbar
    v-model="active"
    :timeout="timeout"
    @mouseover="mouseOver"
    @mouseleave="mouseLeave"
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

const time = setTimeout(() => {
  active.value = false
  emitClose()
}, props.timeout)


const doClose = () => {
  active.value = false
  emitClose()
  clearTimeout(time)
}

const mouseOver = () => {
  clearTimeout(time)
}

const mouseLeave = () => setTimeout(() => {
  active.value = false
  emitClose()
  clearTimeout(time)
}, props.timeout)
</script>

<script lang="ts">
import { defineComponent, ref, defineProps, defineEmits } from 'vue'

export default defineComponent({
  name: 'SnackBar'
})
</script>