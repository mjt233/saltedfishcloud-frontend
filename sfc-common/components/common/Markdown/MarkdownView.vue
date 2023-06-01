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

/**
 * 超链接转跳替换函数
 */
const hrefReplacer = inject('hrefReplacer', (href: string | null) => href)

const rootRef = ref() as Ref<HTMLElement>

let tempRoot: HTMLElement
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

/**
 * markdown token访问器，通过访问函数对token自身及其所有子token进行遍历，免去重复编写递归遍历代码
 * @param token 原始根token
 * @param visitor token访问处理函数
 */
const tokenVisitor = (token: Token, visitor: (token:Token) => void) => {
  if (token.children) {
    token.children.forEach(c => tokenVisitor(c, visitor))
  }
  visitor(token)
}

// 相对路径替换规则，将相对路径图片访问url替换为统一资源访问接口的url
md.core.ruler.push('replace_img_url', (state) => {
  state.tokens.forEach(rootToken => {
    tokenVisitor(rootToken, token => {
      if (token.tag == 'img') {
        const originSrc = token.attrGet('src')
        if (!originSrc || !originSrc.startsWith('./') ) {
          return
        }

        const params = {...props.resourceParams} as ResourceRequest
        const nameArr = originSrc.replace(/^\.\/+/, '').replace(/\/+$/, '').split('/')
        const fileName = nameArr.pop() || ''
        const filePath = nameArr.join('/')
        params.path = StringUtils.appendPath(props.resourceParams?.path || '/', filePath)
        params.name = fileName
        const newSrc = SfcUtils.getApiUrl(API.resource.getCommonResource(params))
        token.attrSet('src', newSrc)
        token.attrSet('file-name', params.name)
      }
    })
  })
  return true
})

// 超链接替换规则，添加默认样式
md.core.ruler.push('render_href_style', state => {
  state.tokens.forEach(rootToken => tokenVisitor(rootToken, token => {
    if (token.tag == 'a' && token.type == 'link_open') {
      token.attrSet('class', 'link break-text')
      const href = token.attrGet('href')
      const newHref = hrefReplacer(href)
      token.attrSet('href', newHref || '')

      if (!href || !href.startsWith('.')) {
        token.attrSet('target', '_blank')
      }
    }
  }))
})

// 标记对应的markdown行数
md.core.ruler.push('scroll_flag', state => state.tokens.forEach(e => tokenVisitor(e, token => {
  if (token.map?.length && token.tag?.length) {
    token.attrSet('line', token.map[0] + '')
  }
})))


/**
 * 给图片添加点击动作，进入看图模式
 */
const addImgClickAction = () => {
  const aTags: NodeListOf<HTMLImageElement> = tempRoot.querySelectorAll('img')
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
  const tempHtml = md.render(props.content || '')
  tempRoot = rootRef.value
  html.value = tempHtml
  await nextTick()
  addImgClickAction()
}

// 监听资源参数变化，实时更新url
const throttleUpdate = MethodInterceptor.createThrottleProxy(MethodInterceptor.wrapFun(update)).invoke
watch(() => props.resourceParams, throttleUpdate, { deep: true})

onMounted(update)

watch(() => props.content, update)
</script>

<script lang="ts">
import highlight from 'highlight.js'
import MarkdownIt from 'markdown-it'
import 'highlight.js/styles/atom-one-dark.css'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted, watch, nextTick, inject } from 'vue'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { ImagePreviewer } from '../Previewer'
import { FileInfo, ResourceRequest } from 'sfc-common/model'
import { API, MethodInterceptor, StringUtils } from 'sfc-common/index'
import Token from 'markdown-it/lib/token'

export default defineComponent({
  name: 'MarkdownView'
})
</script>

<style lang="scss">
.markdown {
  padding: 6px;
  >* {
    margin: 6px 0;
    margin-bottom: 16px;
  }
  code {
    font-family: Menlo,Monaco,Consolas,'Courier New',monospace;
    font-size: .85em !important;
    color: rgb(var(--v-theme-primary));
    background-color: rgba(var(--v-theme-background), .6);
    border-radius: 3px;
  }

  ul,ol {
    margin-left: 2em;
  }

  h1,h2,h3,h4,h5,h6 {
    margin: 18px 0 12px 0;
    font-weight: 600;
    padding-bottom: 0.3em;
  }

  h1 { font-size: 2.25em; }
  h2 { font-size: 1.75em; padding-bottom: 0.3em; }
  h3 { font-size: 1.5em; }
  h4 { font-size: 1.25em; }
  h5 { font-size: 1em; }

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
    font-family: Menlo,Monaco,Consolas,'Courier New',monospace;
    background-color: rgb(30, 30, 30);
    color: rgb(212, 212, 212);
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 0;
    // width: 100%;
  }
}
</style>