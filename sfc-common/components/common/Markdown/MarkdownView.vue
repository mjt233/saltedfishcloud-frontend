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
  },
  resourceParams: {
    type: Object as PropType<ResourceRequest>,
    default: undefined
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
// 渲染a标签，使用md样式
const renderATag = () => {
  const aTags = rootRef.value.querySelectorAll('a')
  aTags.forEach(el => {
    if(!el.classList.contains('link')) {
      el.classList.add('link')
    }
    if(!el.classList.contains('break-text')) {
      el.classList.add('break-text')
    }
    el.target = '_blank'
  })
}

/**
 * 替换相对路径的图片url，相对路径需要使用通用资源获取API
 */
const replaceUrl = () => {
  if (!props.resourceParams) {
    return
  }
  const imgTags: NodeListOf<HTMLImageElement> = rootRef.value.querySelectorAll('img')
  imgTags.forEach(el => {
    let src = el.getAttribute('src')
    if (src && src.startsWith('./')) {
      const params = {...props.resourceParams} as ResourceRequest
      const nameArr = src.replace(/^\.\/+/, '').replace(/\/+$/, '').split('/')
      const fileName = nameArr.pop() || ''
      const filePath = nameArr.join('/')
      params.path = StringUtils.appendPath(props.resourceParams?.path || '/', filePath)
      params.name = fileName
      const newSrc = SfcUtils.getApiUrl(API.resource.getCommonResource(params))
      el.setAttribute('src', newSrc)
      el.setAttribute('title', params.name)
      el.setAttribute('file-name', params.name)
    }
  })
}

// 监听资源参数变化，实时更新url
watch(() => props.resourceParams, () => {
  replaceUrl()
}, { deep: true})

/**
 * 给图片添加点击动作，进入看图模式
 */
const addImgClickAction = () => {
  const aTags: NodeListOf<HTMLImageElement> = rootRef.value.querySelectorAll('img')
  const fileList: FileInfo[] = []
  // 构造文件列表，并设置图片title
  aTags.forEach(el => {
    const url = new URL(el.src)
    const fileName = el.getAttribute('file-name') || ((url.pathname || '').split('/').pop()) as string
    el.title = fileName
    fileList.push({
      name: fileName,
      path: el.src
    } as FileInfo)
  })
  // 添加点击动作，打开看图模式
  aTags.forEach((el, idx) => {
    el.onclick = () => {
      const inst = SfcUtils.dyncmount(ImagePreviewer, {
        props: {
          urlGenerator(file: FileInfo) {
            return file.path
          },
          fileList,
          thumbnailUrlGenerator(file: FileInfo) {
            return file.path
          },
          imageIndex: idx,
          style: {
            position: 'fixed',
            height: '100vh',
            width: '100vw',
            top: 0,
            left: 0,
            zIndex: '114514'
          },
          onClose() {
            inst.unmount()
          },
        },
        vappProps: {
          style: {
            zIndex: 114514,
            background: 'none'
          }
        },
        tempDOMHandler(dom) {
          dom.style.zIndex = '114514'
        }
      })
    }
  })
}
const html = ref('')
const update = async() => {
  html.value = md.render(props.content || '')
  await nextTick()
  renderATag()
  replaceUrl()
  addImgClickAction()
}
onMounted(update)

watch(() => props.content, update)
</script>

<script lang="ts">
import highlight from 'highlight.js'
import MarkdownIt from 'markdown-it'
import 'highlight.js/styles/atom-one-dark.css'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted, watch, nextTick } from 'vue'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { ImagePreviewer } from '../Previewer'
import { FileInfo, ResourceRequest } from 'sfc-common/model'
import { API, StringUtils } from 'sfc-common/index'

export default defineComponent({
  name: 'MarkdownView'
})
</script>

<style lang="scss">
.markdown {
  padding: 6px;
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
    cursor: pointer;
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