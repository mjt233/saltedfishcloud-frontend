<!-- eslint-disable vue/no-v-html -->
<template>
  <div>
    <div style="user-select: text" class="markdown" v-html="html" />
  </div>
</template>

<script setup lang="ts">
const view = ref() as Ref<HTMLElement>
const props = defineProps({
  content: {
    type: String,
    default: ''
  }
})
const md = new MarkdownIt({
  html: true,
  typographer: true
})
const html = ref('')
const update = () => {
  html.value = md.render(props.content)
}
onMounted(update)

watch(() => props.content, update)
</script>

<script lang="ts">
import MarkdownIt from 'markdown-it'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted, watch } from 'vue'

export default defineComponent({
  name: 'MarkdownView'
})
</script>

<style lang="scss">
.markdown {
  >* {
    margin: 6px 0;
  }

  ul {
    margin-left: 20px;
  }

  h1,h2,h3,h4,h5,h6 {
    margin: 18px 0 12px 0;
  }

  hr {
    position: relative;
    border: 0;
    width: calc(100% - 32px);
    margin: 12px auto;
    height: 1px;
    background-color: rgba(var(--v-theme-primary), .7);
  }

  blockquote {
    position: relative;
    padding-left: 12px;
    margin: 18px 0;
    background-color: rgb(var(--v-theme-primary), .1);
    &::before{
      content: '';
      position: absolute;
      left: 0px;
      top: 0px;
      height: 100%;
      width: 3px;
      background-color: rgb(var(--v-theme-primary));
    }
  }
}
</style>