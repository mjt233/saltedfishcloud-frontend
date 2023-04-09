import { ComponentPublicInstance } from 'vue'

export interface CodeEditorExpose {
  insertText(text: string): void
}

export type CodeEditorModel = CodeEditorExpose & ComponentPublicInstance