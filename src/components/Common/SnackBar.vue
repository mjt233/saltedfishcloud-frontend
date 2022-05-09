<template>
  <v-snackbar v-model="active" :timeout="timeout">
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
    default: true
  },
  timeout: {
    type: Number,
    default: 2000
  }
})

const active = ref(true)

const time = setTimeout(() => {
  active.value = false
}, props.timeout)


const doClose = () => {
  active.value = false
  emit('close')
  clearTimeout(time)
}
</script>

<script lang="ts">
import { defineComponent, ref, defineProps, defineEmits } from 'vue'

export default defineComponent({
  name: 'SnackBar'
})
</script>