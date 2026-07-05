<!-- eslint-disable vue/no-v-html -->
<template>
  <div ref="rootRef" class="markdown-view" @scroll="emits('viewScroll', $event)">
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
  },

  /**
   * 是否显示代码块行号
   */
  showLineNumbers: {
    type: Boolean,
    default: false
  }
})

const emits = defineEmits<{
  /**
   * 章节目录树变更事件
   */
  (e: 'chapterChange', data: ChapterTreeNode[]): void,

  /**
   * 视图滚动事件
   */
  (e: 'viewScroll', data: Event): void
}>()

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
    const headerClass = lang ? ' has-header' : ''
    const langLabel = lang ? `<div class="markdown-code-header"><span class="markdown-code-lang">${lang}</span></div>` : ''

    // 当开启行号时，将每行代码包裹在带行号的结构中
    if (props.showLineNumbers) {
      const lines = result.split('\n')
      // highlight.js 结果末尾可能有空行，去掉
      if (lines.length > 0 && lines[lines.length - 1] === '') {
        lines.pop()
      }
      // 根据总行数的位数动态计算行号区域宽度，确保任意行数下分割线对齐
      const maxDigits = String(lines.length).length
      // 每个字符约 0.65em 宽，加上固定 padding 2em，再留 0.5em 余量，最小 3.5em
      const lineNumberWidth = `${Math.max(3.5, maxDigits * 0.65 + 2)}em`
      const numberedLines = lines.map((line, idx) =>
        `<div class="code-line"><span class="line-number" style="width:${lineNumberWidth}">${idx + 1}</span><span class="line-content">${line}</span></div>`
      ).join('')
      return `<div class="markdown-code has-line-numbers${headerClass}">${langLabel}<pre class="markdown-code-pre"><code>${numberedLines}</code></pre></div>`
    }

    return `<div class="markdown-code${headerClass}">${langLabel}<pre class="markdown-code-pre"><code>${result}</code></pre></div>`
  }
}).use(MarkdownItTaskLists, {enabled: true})

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
        if (!originSrc || originSrc.startsWith('http://') || originSrc.startsWith('https://')) {
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
const html = computed(() => md.render(props.content || ''))
const chapterList = ref([]) as Ref<ChapterTreeNode[]>
const updateChapter = () => {
  const createNode = (el: Element) => {
    const level = Number(el.tagName.substring(1))
    const htmlEl = el as HTMLElement
    return {
      title: htmlEl.innerText,
      level: level,
      child: [],
      el: htmlEl
    }
  }
  const els = tempRoot.querySelectorAll('h1,h2,h3,h4,h5')
  chapterList.value = []
  const nodeStack: ChapterTreeNode[] = []
  let prev: ChapterTreeNode

  els.forEach(e => {
    const newNode = createNode(e)
    // 栈空，表示当前是顶级节点
    if (nodeStack.length == 0) {
      nodeStack.push(newNode)
      prev = newNode
      return
    }
    // 等级大于上个节点，表示是子节点
    if(newNode.level > prev.level) {
      prev.child.push(newNode)
      // 把上个节点加入到父节点栈中
      if(nodeStack[nodeStack.length - 1] != prev) {
        nodeStack.push(prev)
      }
      prev = newNode
      return
    }

    // 等级小于上个节点，上个节点不会再有子节点了，找自己的父节点
    if (newNode.level <= prev.level) {
      let parent = nodeStack.pop()
      while( parent && parent.level >= newNode.level ) {
        // 遍历完了都没找到父级，目前看来自己辈分最大
        if (nodeStack.length == 0) {
          nodeStack.push(newNode)
          chapterList.value.push(parent)
          prev = newNode
          return
        }
        parent = nodeStack.pop()
      }
      if (parent) {
        parent?.child.push(newNode)
        nodeStack.push(parent)
      }
      prev = newNode
    }
  })
  if (nodeStack.length) {
    chapterList.value.push(nodeStack[0])
  }
  emits('chapterChange', chapterList.value)
}

/**
 * 为代码块添加右上角复制按钮，点击后调用 SfcUtils.copyToClipboard 复制代码内容
 */
const addCopyButtons = () => {
  const codeBlocks: NodeListOf<HTMLElement> = tempRoot.querySelectorAll('.markdown-code')
  codeBlocks.forEach(block => {
    // 避免重复添加
    if (block.querySelector('.markdown-code-copy-btn')) {
      return
    }
    const btn = document.createElement('button')
    btn.className = 'markdown-code-copy-btn'
    btn.textContent = '复制'
    btn.title = '复制代码'
    btn.onclick = async() => {
      const codeEl = block.querySelector('pre.markdown-code-pre code')
      if (!codeEl) {
        return
      }
      // 当存在行号时，仅提取每行代码内容，排除行号文本
      const lineContents = codeEl.querySelectorAll('.line-content')
      const code = lineContents.length > 0
        ? Array.from(lineContents).map(el => el.textContent || '').join('\n')
        : codeEl.textContent || ''
      try {
        await SfcUtils.copyToClipboard(code)
        btn.textContent = '已复制!'
        setTimeout(() => {
          btn.textContent = '复制'
        }, 1500)
      } catch (err) {
        console.error('复制代码失败', err)
      }
    }
    block.appendChild(btn)
  })
}

/**
 * 在 markdown DOM 完成渲染后补充图片点击行为、复制按钮和章节目录。
 * 这里保留为挂载后执行，避免在首帧渲染阶段打断父容器对该组件内容高度的测量。
 */
const updateRenderedContent = async() => {
  if (!rootRef.value) {
    return
  }

  tempRoot = rootRef.value
  await nextTick()
  addImgClickAction()
  addCopyButtons()
  updateChapter()
}

onMounted(() => {
  void updateRenderedContent()
})

watch(() => props.content, () => {
  void updateRenderedContent()
})
</script>

<script lang="ts">
import highlight from 'highlight.js'
import MarkdownIt from 'markdown-it'
import MarkdownItTaskLists from 'markdown-it-task-lists'
import 'highlight.js/styles/atom-one-dark.css'
import { computed, defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted, watch, nextTick, inject } from 'vue'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { ImagePreviewer } from '../Previewer'
import { FileInfo, ResourceRequest } from 'sfc-common/model'
import { StringUtils } from 'sfc-common'
import Token from 'markdown-it/lib/token'
import { ChapterTreeNode as ChapterTreeNode } from './type'
import API from 'sfc-common/api'

export default defineComponent({
  name: 'MarkdownView'
})
</script>

<style lang="scss" scoped>
.markdown-view {
  position: relative;
}
</style>

<style lang="scss">
.markdown {
  padding: 8px;
  font-size: .9375rem;
  line-height: 1.7;
  color: rgba(var(--v-theme-on-surface), .87);

  >* {
    margin: 8px 0;
    margin-bottom: 16px;
  }

  // 排除代码块和图片不受通用 margin 影响
  > .markdown-code,
  > .markdown-code-header {
    margin: 0 0 16px 0;
  }

  // ========== 行内代码 ==========
  // 只匹配不在 .markdown-code 内的 code（避免与代码块冲突）
  > code,
  > p code,
  > li code,
  > td code,
  > th code,
  > blockquote code {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
    font-size: .875em;
    color: rgb(var(--v-theme-primary));
    background-color: rgba(var(--v-theme-primary), .08);
    border-radius: 4px;
    padding: 2px 6px;
    word-break: break-word;
  }

  // ========== 标题 ==========
  h1, h2, h3, h4, h5, h6 {
    font-weight: 500;
    margin: 24px 0 12px 0;
    padding-bottom: 0;
    color: rgba(var(--v-theme-on-surface), .87);
    line-height: 1.4;
  }

  h1 {
    font-size: 2em;
    font-weight: 400;
    letter-spacing: -.015625em;
    margin-top: 32px;
  }
  h2 {
    font-size: 1.5em;
    font-weight: 400;
    letter-spacing: -.008333em;
    padding-bottom: .4em;
    border-bottom: 1px solid rgba(var(--v-theme-on-surface), .12);
  }
  h3 {
    font-size: 1.25em;
    font-weight: 500;
    letter-spacing: 0;
  }
  h4 {
    font-size: 1.0625em;
    font-weight: 500;
    letter-spacing: .009375em;
  }
  h5 {
    font-size: .9375em;
    font-weight: 500;
    letter-spacing: .00625em;
  }

  // ========== 分割线 ==========
  hr {
    border: 0;
    margin: 24px 0;
    height: 1px;
    background-color: rgba(var(--v-theme-on-surface), .12);
  }

  // ========== 图片 ==========
  img {
    max-width: 100%;
    border-radius: 12px;
    cursor: pointer;
    transition: box-shadow .2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, .08);

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, .15);
    }
  }

  // ========== 引用块 ==========
  blockquote {
    position: relative;
    margin: 16px 0;
    padding: 12px 16px 12px 20px;
    background-color: rgba(var(--v-theme-primary), .05);
    border-radius: 0 12px 12px 0;
    border-left: 4px solid rgb(var(--v-theme-primary));

    >* {
      margin: 4px 0;
      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  // ========== 链接 ==========
  a.link {
    color: rgb(var(--v-theme-primary));
    text-decoration: none;
    font-weight: 500;
    border-bottom: 1px solid transparent;
    transition: border-color .2s ease;

    &:hover {
      border-bottom-color: rgb(var(--v-theme-primary));
    }
  }

  // ========== 无序/有序列表 ==========
  ul, ol {
    padding-left: 24px;
    margin: 12px 0;

    li {
      margin: 4px 0;
      line-height: 1.7;

      &::marker {
        color: rgb(var(--v-theme-primary));
      }
    }
  }

  // 无序列表圆点样式
  ul {
    list-style-type: disc;

    ul {
      list-style-type: circle;
    }
  }

  // ========== 任务列表 ==========
  .task-list-item {
    list-style: none;
    margin-left: -24px;
    padding-left: 0;

    input[type="checkbox"] {
      appearance: none;
      -webkit-appearance: none;
      width: 18px;
      height: 18px;
      border: 2px solid rgba(var(--v-theme-on-surface), .54);
      border-radius: 2px;
      vertical-align: middle;
      margin-right: 8px;
      position: relative;
      cursor: pointer;
      transition: all .15s ease;
      background-color: transparent;

      &:checked {
        background-color: rgb(var(--v-theme-primary));
        border-color: rgb(var(--v-theme-primary));

        &::after {
          content: '';
          position: absolute;
          left: 3px;
          top: 0px;
          width: 5px;
          height: 10px;
          border: solid rgb(var(--v-theme-on-primary));
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }
      }

      &:hover {
        border-color: rgb(var(--v-theme-primary));
      }
    }
  }

  // ========== 表格 ==========
  table {
    width: 100%;
    border-spacing: 0;
    border-collapse: separate;
    margin: 16px 0;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, .08), 0 1px 2px rgba(0, 0, 0, .06);
    background-color: rgb(var(--v-theme-surface));
  }

  thead {
    background-color: rgba(var(--v-theme-primary), .08);

    th {
      color: rgba(var(--v-theme-on-surface), .87);
      font-weight: 600;
      font-size: .8125em;
      text-align: left;
      padding: 14px 16px;
      letter-spacing: .04em;
      text-transform: uppercase;
      line-height: 1.5;
      border-bottom: 1px solid rgba(var(--v-theme-on-surface), .12);
    }
  }

  tbody {
    tr {
      transition: background-color .15s ease;

      &:nth-child(even) {
        background-color: rgba(var(--v-theme-on-surface), .02);
      }

      &:hover {
        background-color: rgba(var(--v-theme-primary), .05);
      }

      &:last-child td {
        border-bottom: none;
      }
    }

    td {
      padding: 14px 16px;
      font-size: .875em;
      line-height: 1.5;
      border-bottom: 1px solid rgba(var(--v-theme-on-surface), .08);
      color: rgba(var(--v-theme-on-surface), .87);
    }
  }

  // ========== 代码块 ==========
  .markdown-code {
    position: relative;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
    border-radius: 8px;
    margin-bottom: 0;
    overflow: hidden;
    border: 1px solid rgba(var(--v-theme-on-surface), .12);
    background-color: #282c34;

    // 复制按钮
    .markdown-code-copy-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      z-index: 1;
      padding: 2px 10px;
      font-size: .75rem;
      line-height: 1.5;
      font-family: inherit;
      color: rgba(255, 255, 255, .6);
      background-color: rgba(255, 255, 255, .08);
      border: 1px solid rgba(255, 255, 255, .12);
      border-radius: 4px;
      cursor: pointer;
      opacity: 0;
      transition: opacity .2s ease, background-color .15s ease, color .15s ease;

      &:hover {
        color: rgba(255, 255, 255, .9);
        background-color: rgba(255, 255, 255, .18);
      }
    }

    // 有语言标签头部时，按钮位于头部内
    &.has-header .markdown-code-copy-btn {
      top: 6px;
      right: 8px;
    }

    &:hover > .markdown-code-copy-btn {
      opacity: 1;
    }

    // 语言标签头部
    .markdown-code-header {
      display: flex;
      align-items: center;
      padding: 5px 14px;
      background-color: rgba(255, 255, 255, .08);
      border-bottom: 1px solid rgba(255, 255, 255, .08);

      .markdown-code-lang {
        font-size: .75rem;
        font-weight: 500;
        letter-spacing: .04em;
        text-transform: uppercase;
        color: rgba(255, 255, 255, .5);
      }
    }

    // 带行号的代码块布局
    &.has-line-numbers {
      .markdown-code-pre {
        padding: 16px 16px 16px 0;

        .code-line {
          display: flex;
          min-height: 1.6em;

          &:hover {
            background-color: rgba(255, 255, 255, .04);
          }
        }

        .line-number {
          display: block;
          box-sizing: border-box;
          padding: 0 12px 0 16px;
          text-align: right;
          color: rgba(255, 255, 255, .25);
          user-select: none;
          border-right: 1px solid rgba(255, 255, 255, .1);
          margin-right: 16px;
          flex-shrink: 0;
        }

        .line-content {
          flex: 1;
          min-width: 0;
          padding-right: 16px;
        }
      }
    }

    // 代码内容区
    .markdown-code-pre {
      margin: 0;
      padding: 16px;
      overflow: auto;
      background: transparent;
      line-height: 1.6;

      code {
        font-family: inherit;
        font-size: .9375em;
        line-height: 1.6;
        color: #abb2bf;
        background: transparent !important;
        padding: 0 !important;
        border-radius: 0 !important;
        word-break: normal;
      }
    }
  }

  // 重置 highlight.js 全局背景设置，避免穿透产生色块
  .hljs {
    background: transparent !important;
    padding: 0 !important;
  }

  // ========== 删除线/加粗/斜体 ==========
  del {
    color: rgba(var(--v-theme-on-surface), .38);
  }

  strong {
    font-weight: 600;
    color: rgba(var(--v-theme-on-surface), .95);
  }

  em {
    font-style: italic;
  }
}
</style>