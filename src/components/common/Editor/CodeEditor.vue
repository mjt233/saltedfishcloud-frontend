<template>
  <div class="code-editor-container">
    <div ref="editorRef" class="code-editor" />
  </div>
  
</template>

<script setup lang="ts">
const editorRef = ref() as Ref<HTMLElement>
const props = defineProps({
  language: {
    type: String as PropType<'javascript' | 'ts' | 'json' | 'css' | 'html'>,
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
  }
})
const emits = defineEmits(['update:modelValue'])
const workerMap = {
  jsonWorker,
  htmlWorker,
  editWorker,
  typescriptWorker
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
watch(() => props.modelValue, () => {
  if (editor && editor.getValue() != props.modelValue) {
    editor.setValue(props.modelValue)
  }
})
onMounted(() => {
  editor = monaco.editor.create(editorRef.value, {
    language: props.language,
    value: props.modelValue,
    minimap: {
      enabled: props.useMiniMap
    },
    lineNumbers: props.hideLineNumber ? 'off' : 'on'
  })
  editor.onDidChangeModelContent(e => {
    emits('update:modelValue', editor.getValue())
  })
})

onUnmounted(() => {
  editor.dispose()
})


</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted, onUnmounted, watch } from 'vue'
import * as monaco from 'monaco-editor'
import editWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import typescriptWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

export default defineComponent({
  name: 'CodeEditor'
})
</script>


<style scoped>
.code-editor-container {
  padding: 3px;
  border: 1px solid rgba(var(--v-theme-primary), .2);
  border-radius: 3px;
  box-shadow: 0 0 2px 0px rgba(var(--v-theme-primary), .2);
}

.code-editor {
  min-height: 120px;
}
</style>