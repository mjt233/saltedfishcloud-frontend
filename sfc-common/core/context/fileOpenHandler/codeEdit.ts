
import API from 'sfc-common/api'
import { CodeEditor } from 'sfc-common/components'
import { FileInfo, FileListContext } from 'sfc-common/model'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { context } from '..'
import { FileOpenHandler } from '../type'
import { StringFormatter } from 'sfc-common/utils'
import * as monaco from 'monaco-editor'

async function doSave(ctx: FileListContext, file: FileInfo, content: string) {
  try {
    let path = ctx.path || file.path
    if (!path) {
      path = (await SfcUtils.request(API.resource.parseNodeId(file.uid, file.node))).data.data
      if (!path) {
        throw new Error('无法获取到文件路径')
      }
    }
    const newFile = new File([new Blob([content])], file.name, { type: 'text/plain'})
    SfcUtils.beginLoading()
    await SfcUtils.request(API.file.upload(file.uid, path, newFile))
    await ctx.modelHandler.refresh()
    SfcUtils.snackbar('保存成功')
  } finally {
    SfcUtils.closeLoading()
  }
}

/**
 * 打开文件编辑对话框
 * @param component 文件编辑组件，需要支持通过modeValue传文件内容
 * @param componentProps 组件的额外参数
 * @param url 文件加载url
 * @param ctx 文件列表上下文
 * @param file 待操作文件
 */
export async function openFileEditDialog(component: any, componentProps: any, url: string, ctx: FileListContext, file: FileInfo) {
  SfcUtils.beginLoading()
  try {
    const session = context.session.value
    const ret = await SfcUtils.request({ url })
    let newText = ret.request.responseText
    let originText = newText
    SfcUtils.openComponentDialog(component, {
      props: {
        modelValue: ret.request.responseText,
        'onUpdate:modelValue'(val: string) {
          newText = val
        },
        ...componentProps,
        /**
         * 由于ctrl+s触发的保存事件
         * @param content 保存的文件内容
         */
        async onSave(content: string) {
          if (originText == content) {
            SfcUtils.snackbar('文件无变更')
            return false
          }
          await doSave(ctx, file, content)
          originText = content
          return true
        }
      },
      fullscreen: true,
      persistent: true,
      title: file.name,
      showConfirm: !ctx.readonly && (!!session.token && (file.uid == session.user.id) || (file.uid == 0 && session.user.role == 'admin')),
      async onConfirm() {
        try {
          if (newText == ret.request.responseText) {
            SfcUtils.snackbar('文件无变更')
            return true
          }
          await doSave(ctx, file, newText)
          return true
        } catch(err) {
          SfcUtils.snackbar(err)
          return false
        } finally {
          SfcUtils.closeLoading()
        }
      }
    })
  } finally {
    SfcUtils.closeLoading()
  }
}

const confirmOpen = async(ctx: FileListContext, file: FileInfo) => {
  if (file.size > 1024 * 1024 * 32) {
    return SfcUtils.confirm(`文件较大(${StringFormatter.toSize(file.size)})，可能会导致浏览器卡死或加载时间过长，是否继续？`, '文件太大', {
      cancelToReject: true
    })
  } else {
    return true
  }
}

const doOpen = (ctx: FileListContext, file: FileInfo) => {
  const url = ctx.getFileUrl(file)
  if (!url) {
    throw new Error('无法获取文件url')
  }
  const extName = file.name.split('.').pop()?.toLowerCase() || file.name
  const dotExtName = `.${extName}`

  // 匹配语言
  const language = monaco.languages.getLanguages().find(l => l.id == extName || l.extensions?.includes(dotExtName))?.id || 'plaintext'

  const props = {
    language,
    autoGrow: false,
    useMiniMap: true,
    style: {
      height: '100%'
    }
  }
  openFileEditDialog(CodeEditor, props, url, ctx, file)
}

const handler: FileOpenHandler = {
  id: 'code-edit',
  title: '编辑器',
  icon: 'mdi-pencil',
  matcher(ctx, file) {
    if (ctx.readonly) {
      return false
    }
    const extName = file.name.split('.').pop()?.toLowerCase() || file.name
    const supportType = new Set([
      'js', 'ts', 'tsx', 'jsx',
      'html', 'htm', 'xml','vue',
      'css', 'scss', 'less',
      'go', 'c', 'cpp','java',
      'py','bat', 'cmd', 'lua','php', 'sh',
      'sql', 'json', 'txt', 'ini', 'log', 'properties', 'cfg', 'dockerfile', 'yml', 'yaml'
    ])
    return supportType.has(extName)
  },
  sort: 0,
  async action(ctx, file) {
    await confirmOpen(ctx, file)
    doOpen(ctx, file)
  }
}

export default handler