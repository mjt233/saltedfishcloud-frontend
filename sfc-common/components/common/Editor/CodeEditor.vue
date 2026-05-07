<template>
  <div class="code-editor-container">
    <div ref="editorRef" class="code-editor" />
  </div>
</template>

<script setup lang="ts">
const editorRef = ref() as Ref<HTMLElement>
const props = defineProps({
  language: {
    type: String as PropType<'javascript' | 'ts' | 'json' | 'css' | 'html' | 'java' | 'markdown'>,
    default: 'json'
  },
  useMiniMap: {
    type: Boolean,
    default: false
  },
  modelValue: {
    type: String,
    default: ''
  },
  hideLineNumber: {
    type: Boolean,
    default: false
  },
  /**
   * 是否自动调整高度
   */
  autoGrow: {
    type: Boolean,
    default: true
  },
  /**
   * 自动调整的高度最大行数
   */
  autoGrowMaxLine: {
    type: Number,
    default: 15
  },
  readOnly: {
    type: Boolean,
    default: false
  },
  /**
   * 是否折行显示
   */
  wordWrap: {
    type: Boolean,
    default: true
  },
  /**
   * 文本发生变化时自动滚动到底部
   */
  autoToScrollBottom: {
    type: Boolean,
    default: false
  }
})
const emits = defineEmits<{
  (name: 'update:modelValue', val: string): void,
  (name: 'patseImage', val: File): void,
  (name: 'save', val: string): void
}>()
const workerMap = {
  jsonWorker,
  htmlWorker,
  editWorker,
  typescriptWorker,
  cssWorker
} as {[s:string]: new () => Worker}
self.MonacoEnvironment = {
  getWorker: (id, label) => {
    if (label == 'javascript') {
      label = 'typescript'
    }
    const worker = workerMap[label + 'Worker'] || workerMap.editWorker
    return new worker
  }
}

let editor: monaco.editor.IStandaloneCodeEditor
const containerHeight = ref('auto')

/**
 * 获取字符串行数
 * @param str 待查找字符串
 * @param max 最大检查行数
 */
const findLineCount = (str: string, max: number) => {
  if (!str || str.length == 0) {
    return 0
  }
  let count = 0
  let idx = 0
  while(idx != -1 && count < max) {
    idx = str.indexOf('\n', idx)
    if (idx != -1) {
      idx++
      count++
    }
  }
  return count + 1
}
watch(() => props.modelValue, () => {
  if (editor && editor.getValue() != props.modelValue) {
    editor.setValue(props.modelValue)
  }
})

/**
 * 高度自动更新
 */
const growHeight = () => {
  if (props.autoGrow) {
    const line = findLineCount(editor.getValue(), props.autoGrowMaxLine)
    containerHeight.value = (line < props.autoGrowMaxLine ? line : props.autoGrowMaxLine) * 19 + 13 + 'px'
  }
}

/**
 * 监听编辑器粘贴处理
 */
const listenPaste = () => {
  
  // 监听 Monaco 的粘贴事件钩子
  editor.onDidPaste(async(e) => {
    try {
      // 1. 获取剪切板内容
      const clipboardItems = await navigator.clipboard.read()
      
      for (const item of clipboardItems) {
        // 2. 筛选出图片类型的 MIME Type
        const imageType = item.types.find(type => type.startsWith('image/'))
        
        if (imageType) {
          // 3. 异步获取 Blob 数据
          const blob = await item.getType(imageType)
          
          // 4. 转换为 File 对象并提交事件
          const file = new File([blob], `pasted-image-${Date.now()}.png`, { type: imageType })
          emits('patseImage', file)
        }
      }
    } catch (err) {
      // 如果用户拒绝了剪切板权限，或者浏览器不支持，会进入这里
      console.error('无法读取剪切板数据:', err)
    }
  })
}


/**
 * 在编辑器当前光标处插入文本（外部方法）
 * @param text 待插入的文本
 */
const insertText =  async(text: string) => {
  const position = editor.getPosition()
  if (position) {
    editor.executeEdits('', [{
      range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
      text: text
    }])
    await SfcUtils.sleep(100)
    editor.focus()
  }
}

const scrollToBottom  = () => {
  if (!props.autoToScrollBottom) {
    return
  }
  const height = editor.getLayoutInfo().height
  const top = editor.getBottomForLineNumber(Number.MAX_VALUE)
  const theBottomPositionTop = top - height
  editor.setScrollPosition({
    scrollTop: theBottomPositionTop <= 0 ? 0 : theBottomPositionTop
  })
}

onMounted(async() => {
  editor = monaco.editor.create(editorRef.value, {
    language: props.language,
    value: props.modelValue,
    minimap: {
      enabled: props.useMiniMap
    },
    lineNumbers: props.hideLineNumber ? 'off' : 'on',
    automaticLayout: true,
    theme: getContext().theme.value == 'dark' ? 'vs-dark' : 'vs',
    readOnly: props.readOnly,
    wordWrap: props.wordWrap ? 'on' : 'off'
  })
  // 触发update:modelValue，以及自动滚动到底部和自动拓展高度
  editor.onDidChangeModelContent(e => {
    emits('update:modelValue', editor.getValue())
    scrollToBottom()
    growHeight()
  })
  // 注册Ctrl+S保存事件
  editor.addAction({
    id: 'save',
    label: 'save',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
    run(editor, ...args) {
      if (!props.readOnly) {
        emits('save', editor.getValue())
      } else {
        SfcUtils.snackbar('只读文件，无法保存')
      }
    },
  })
  await nextTick()
  editor.layout({ height: 100, width: 100 })
  listenPaste()
  await SfcUtils.sleep(50)
  scrollToBottom()
})

onUnmounted(() => {
  editor.dispose()
})

defineExpose({
  insertText,
  getEditor: () => editor,
  jumpToLine: (line: number) => editor.revealLineNearTop(line)
} as CodeEditorExpose)


</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as monaco from 'monaco-editor'
import editWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import typescriptWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import { getContext } from 'sfc-common/core/context'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { CodeEditorExpose } from 'sfc-common/model/component/CodeEditorModel'

export default defineComponent({
  name: 'CodeEditor'
})
</script>


<style scoped>
.code-editor-container {
  min-height: 120px;
  height: v-bind(containerHeight);
  padding: 3px;
  border: 1px solid rgba(var(--v-theme-primary), .2);
  border-radius: 3px;
  box-shadow: 0 0 2px 0px rgba(var(--v-theme-primary), .2);
}

.code-editor {
  height: 100%;
}
</style>