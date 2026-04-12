import { Component } from 'vue'
import { FileListContext } from 'sfc-common/model'
import { getContext } from './index'

/** 文件属性面板扩展段渲染项 */
export interface FileAttributeSectionItem {
  /** 扩展段标题，存在值时在组件上方显示 */
  title?: string
  /** 要渲染的组件 */
  component: Component | string
  /** 传给组件的 props */
  props?: Record<string, any>
  /** 是否默认展开 */
  defaultExpanded?: boolean
}

/**
 * 文件属性扩展。
 * 外部插件通过 resolve 自行决定可见性和 props 生成，
 * 返回 null 表示不展示。
 */
export interface FileAttributeExtension {
  /** 唯一标识，同 id 覆盖注册 */
  id: string
  /**
   * 根据文件列表上下文解析出要展示的段。
   * 返回 null/undefined 表示当前不展示。
   */
  resolve: (ctx: FileListContext) => FileAttributeSectionItem | null | undefined
}

/**
 * 注册一个文件属性面板扩展段。
 * 同 id 会覆盖已注册的扩展。
 */
export function registerFileAttributeSection(extension: FileAttributeExtension) {
  const sections = getContext().fileAttributeSections.value
  const idx = sections.findIndex(s => s.id === extension.id)
  if (idx !== -1) {
    sections[idx] = extension
  } else {
    sections.push(extension)
  }
}
