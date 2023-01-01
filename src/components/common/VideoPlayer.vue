<template>
  <div ref="rootRef">
    <h1>播放加载失败了QAQ</h1>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  url: {
    type: String,
    default: undefined
  }
})
const rootRef = ref() as Ref<HTMLElement>
let dp:DPlayer

const initPlayer = () => {
  if (!props.url) {
    return
  }
  const opt:DPlayerOptions = {
    container: rootRef.value,
    video: {
      url: props.url
    }
  }
  dp = new DPlayer(opt)
  dp.play()
}

onMounted(async() => {
  await nextTick()
  initPlayer()
})

watch(() => props.url, initPlayer)
</script>

<script lang="ts">
import DPlayer from 'dplayer'
import { DPlayerOptions } from 'dplayer'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted, nextTick, watch, reactive } from 'vue'

export default defineComponent({
  name: 'VideoPlayer'
})
</script>