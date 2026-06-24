/**
 * Groovy 筛选脚本编辑器的变量补全配置。
 *
 * 提供 `record`（InvalidDataRecord）和 `typeCheckResult`（FileTypeCheckResult）
 * 两个内置变量的字段补全数据、变量描述信息，以及 Monaco CompletionItemProvider 实现。
 *
 * @module groovy-completions
 */

/**
 * 单个字段补全项的数据结构
 */
export interface FieldCompletionDef {
  /** 字段名，同时也是补全插入文本 */
  label: string
  /** 字段类型注解（如 'String'、'Long'） */
  detail: string
  /** 字段的中文描述 */
  documentation: string
}

/**
 * 脚本内置变量的描述信息
 */
export interface VariableDef {
  /** 变量名 */
  name: string
  /** 变量的类型全名 */
  type: string
  /** 变量的中文说明 */
  description: string
  /** 该变量的字段列表 */
  fields: FieldCompletionDef[]
}

/**
 * record 变量（InvalidDataRecord）的字段补全项定义
 * 字段名和描述对应 model.ts 中 InvalidDataRecord 接口的 JSDoc 注释
 */
const recordFields: FieldCompletionDef[] = [
  { label: 'id', detail: 'IdType', documentation: '记录唯一标识' },
  { label: 'createAt', detail: 'String', documentation: '记录创建时间（ISO 8601格式）' },
  { label: 'updateAt', detail: 'String', documentation: '记录最后更新时间（ISO 8601格式）' },
  { label: 'type', detail: 'String', documentation: '失效数据类型：FILE_RECORD / PHYSICAL_STORAGE' },
  { label: 'storeMode', detail: 'String', documentation: '文件存储模式：RAW / UNIQUE' },
  { label: 'storagePath', detail: 'String', documentation: '文件在存储系统中的路径' },
  { label: 'ownerUid', detail: 'IdType', documentation: '文件所有者的用户ID' },
  { label: 'diskPath', detail: 'String | null', documentation: '文件在磁盘上的物理路径，可能为null' },
  { label: 'fileSize', detail: 'Long', documentation: '文件大小（字节）' },
  { label: 'lastModified', detail: 'String', documentation: '文件最后修改时间（ISO 8601格式）' },
  { label: 'needIdentify', detail: 'Boolean', documentation: '是否需要进行文件类型识别' },
  { label: 'fileType', detail: 'String | null', documentation: '文件MIME类型，未经识别时可能为null' },
  { label: 'metadata', detail: 'String | null', documentation: '文件元数据JSON字符串，可能为null' },
  { label: 'status', detail: 'String', documentation: '记录当前处理状态：PENDING / PUBLISHED / CLAIMED / COMPLETED' },
  { label: 'processMethod', detail: 'String | null', documentation: '处理方式：DISCARD / AUTO_FIX / CLAIM / null' },
  { label: 'md5', detail: 'String', documentation: '文件MD5校验值' },
  { label: 'typeCheckResult', detail: 'String', documentation: '类型检测结果JSON，反序列化后为 FileTypeCheckResult' }
]

/**
 * typeCheckResult 变量（FileTypeCheckResult）的字段补全项定义
 */
const typeCheckResultFields: FieldCompletionDef[] = [
  { label: 'providerId', detail: 'String', documentation: '提供该结果的Provider的id' },
  { label: 'typeId', detail: 'String', documentation: '文件类型标识' },
  { label: 'typeName', detail: 'String', documentation: '文件类型名称' },
  { label: 'detail', detail: 'FileTypeCheckResultDetail', documentation: '识别结果详情' }
]

/**
 * typeCheckResult.detail 变量（FileTypeCheckResultDetail）的字段补全项定义
 */
const detailFields: FieldCompletionDef[] = [
  { label: 'typeId', detail: 'String', documentation: '文件类型标识（由 Provider 在 checkFile 时设置）' },
  { label: 'typeName', detail: 'String', documentation: '文件类型名称' },
  { label: 'extension', detail: 'String', documentation: '文件可能的拓展名（包含.）' },
  { label: 'mimetype', detail: 'String', documentation: '文件的MIME类型' },
  { label: 'metadata', detail: 'Map<String, String>', documentation: '提取的元数据' },
  { label: 'message', detail: 'String', documentation: '额外的提示信息' }
]

/**
 * 脚本内置变量描述列表，供 UI 展示变量参考信息
 */
export const variables: VariableDef[] = [
  {
    name: 'record',
    type: 'InvalidDataRecord',
    description: '当前遍历的失效数据记录对象',
    fields: recordFields
  },
  {
    name: 'typeCheckResult',
    type: 'FileTypeCheckResult',
    description: '文件类型识别结果对象（record.typeCheckResult 反序列化后的结构）',
    fields: typeCheckResultFields
  },
  {
    name: 'typeCheckResult.detail',
    type: 'FileTypeCheckResultDetail',
    description: '文件类型识别结果详情',
    fields: detailFields
  }
]

/**
 * 根据上下文前缀返回对应的补全项列表
 * @param prefix 上下文前缀（如 'record.'、'typeCheckResult.detail.'）
 * @param range 补全项的替换范围
 * @returns Monaco CompletionItem 数组，无匹配时返回 undefined
 */
const resolveCompletionItems = (
  prefix: string,
  range: { startLineNumber: number; startColumn: number; endLineNumber: number; endColumn: number }
) => {
  const monaco = window.monaco
  const kind = monaco.languages.CompletionItemKind.Field

  const toItems = (fields: FieldCompletionDef[]) =>
    fields.map(f => ({
      label: f.label,
      kind,
      detail: f.detail,
      documentation: f.documentation,
      insertText: f.label,
      range
    }))

  if (prefix === 'record.') {
    return toItems(recordFields)
  }
  if (prefix === 'typeCheckResult.detail.') {
    return toItems(detailFields)
  }
  if (prefix === 'typeCheckResult.') {
    return toItems(typeCheckResultFields)
  }
  return undefined
}

/**
 * Monaco CompletionItemProvider 的 provideCompletionItems 实现。
 * 根据光标前的文本判断上下文，为 record / typeCheckResult 提供字段补全。
 * 仅在脚本编辑器的 CodeEditor 实例中使用，不会影响其他编辑器。
 *
 * @param model Monaco 文本模型
 * @param position 当前光标位置
 * @returns Monaco CompletionItem 数组，无匹配时返回 undefined
 */
export const provideGroovyCompletions = (
  model: any,
  position: any
) => {
  const monaco = window.monaco
  // 获取光标所在行的文本
  const lineContent = model.getLineContent(position.lineNumber)
  // 截取光标前的文本，匹配变量属性访问的前缀
  const textBefore = lineContent.substring(0, position.column - 1)
  // 匹配 record.xxx 或 typeCheckResult.xxx.yyy 模式
  const match = textBefore.match(/(typeCheckResult\.detail\.|typeCheckResult\.|record\.)$/)

  if (match) {
    const prefix = match[1]
    // range 从当前光标位置开始（紧跟 "." 后面正在输入的位置）
    const range = {
      startLineNumber: position.lineNumber,
      startColumn: position.column,
      endLineNumber: position.lineNumber,
      endColumn: position.column
    }
    return resolveCompletionItems(prefix, range)
  }

  // 当直接输入变量名时，提供变量级别的补全
  const wordMatch = textBefore.match(/([a-zA-Z_]\w*)$/)
  if (wordMatch) {
    const partialWord = wordMatch[1]
    const range = {
      startLineNumber: position.lineNumber,
      startColumn: position.column - partialWord.length,
      endLineNumber: position.lineNumber,
      endColumn: position.column
    }
    // 仅当部分输入匹配变量名前缀时才提供变量补全
    if ('record'.startsWith(partialWord) || 'typeCheckResult'.startsWith(partialWord)) {
      return [
        {
          label: 'record',
          kind: monaco.languages.CompletionItemKind.Variable,
          detail: 'InvalidDataRecord',
          documentation: '当前遍历的失效数据记录对象',
          insertText: 'record',
          range
        },
        {
          label: 'typeCheckResult',
          kind: monaco.languages.CompletionItemKind.Variable,
          detail: 'FileTypeCheckResult',
          documentation: '文件类型识别结果对象（record.typeCheckResult 反序列化后的结构）',
          insertText: 'typeCheckResult',
          range
        }
      ]
    }
  }

  return undefined
}
