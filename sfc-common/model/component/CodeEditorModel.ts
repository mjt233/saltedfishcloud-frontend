import { editor } from 'monaco-editor'
import { ComponentPublicInstance } from 'vue'


export interface CodeEditorExpose {
  insertText(text: string): void
  getEditor: () =>  editor.IStandaloneCodeEditor,
  jumpToLine: (line: number) => void
}

export type CodeEditorModel = CodeEditorExpose & ComponentPublicInstance