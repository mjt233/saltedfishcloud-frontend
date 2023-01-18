<!-- eslint-disable vue/no-v-html -->
<template>
  <div ref="rootRef">
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
const rootRef = ref() as Ref<HTMLElement>
const md = new MarkdownIt({
  html: true,
  typographer: true,
  highlight(str, lang) {
    let result = str
    if(str && lang && highlight.getLanguage(lang)) {
      try {
        result = highlight.highlight(str, {
          language: lang
        }).value
      }catch (err) {
        console.error(err)
      }
    }
    return `<div class="markdown-code">${result}</div>`
  }
})
const html = ref('')
const update = async() => {
  html.value = md.render(props.content || '')
  await nextTick()
  const aTags = rootRef.value.querySelectorAll('a')
  aTags.forEach(el => {
    if(!el.classList.contains('link')) {
      el.classList.add('link')
    }
    if(!el.classList.contains('break-text')) {
      el.classList.add('break-text')
    }
  })
}
onMounted(update)

watch(() => props.content, update)
</script>

<script lang="ts">
import highlight from 'highlight.js'
import MarkdownIt from 'markdown-it'
import 'highlight.js/styles/atom-one-dark.css'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted, watch, nextTick } from 'vue'

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

  img {
    max-width: 100%;
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

  .markdown-code {
    background-color: rgb(30, 30, 30);
    color: rgb(212, 212, 212);
    border-radius: 6px;
    padding: 6px;
    // width: 100%;
  }
}
</style>