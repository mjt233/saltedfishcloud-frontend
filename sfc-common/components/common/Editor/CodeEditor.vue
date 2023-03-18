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
  }
})
const emits = defineEmits(['update:modelValue'])
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

onMounted(async() => {
  editor = monaco.editor.create(editorRef.value, {
    language: props.language,
    value: props.modelValue,
    minimap: {
      enabled: props.useMiniMap
    },
    lineNumbers: props.hideLineNumber ? 'off' : 'on',
    automaticLayout: true,
    theme: context.theme.value == 'dark' ? 'vs-dark' : 'vs',
    readOnly: props.readOnly,
    wordWrap: props.wordWrap ? 'on' : 'off'
  })
  editor.onDidChangeModelContent(e => {
    emits('update:modelValue', editor.getValue())
    growHeight()
  })
  await nextTick()
  editor.layout({ height: 100, width: 100 })
})

onUnmounted(() => {
  editor.dispose()
})


</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as monaco from 'monaco-editor'
import editWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import typescriptWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import { context } from 'sfc-common/core/context'

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