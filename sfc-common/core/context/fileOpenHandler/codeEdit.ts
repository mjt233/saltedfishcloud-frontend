
import API from 'sfc-common/api'
import { CodeEditor } from 'sfc-common/components'
import { FileInfo, FileListContext } from 'sfc-common/model'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { context } from '..'
import { FileOpenHandler } from '../type'

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
    SfcUtils.openComponentDialog(component, {
      props: {
        modelValue: ret.request.responseText,
        'onUpdate:modelValue'(val: string) {
          newText = val
        },
        ...componentProps
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
          let path = ctx.path || file.path
          if (!path) {
            path = (await SfcUtils.request(API.resource.parseNodeId(file.uid, file.node))).data.data
            if (!path) {
              throw new Error('无法获取到文件路径')
            }
          }
          const newFile = new File([new Blob([newText])], file.name, { type: 'text/plain'})
          SfcUtils.beginLoading()
          await SfcUtils.request(API.file.upload(file.uid, path, newFile))
          await ctx.modelHandler.refresh()
          SfcUtils.snackbar('保存成功')
        } catch(err) {
          SfcUtils.snackbar(err)
          return false
        } finally {
          SfcUtils.closeLoading()
        }
        return true
      }
    })
  } finally {
    SfcUtils.closeLoading()
  }
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
      'html', 'htm', 'xml',
      'css', 'scss', 'less',
      'python', 'php', 'c', 'cpp','java', 'json','bat', 'lua',
      'txt', 'ini', 'log', 'properties', 'cfg', 'vue'
    ])
    return supportType.has(extName)
  },
  sort: 0,
  async action(ctx, file) {
    const url = ctx.getFileUrl(file)
    if (!url) {
      throw new Error('无法获取文件url')
    }
    const extName = file.name.split('.').pop()?.toLowerCase() || file.name

    // 匹配语言
    let language
    if (['js', 'ts', 'tsx', 'jsx'].includes(extName)) {
      language = 'javascript'
    } else if (extName == 'json') {
      language = 'json'
    } else if (['html', 'htm', 'vue', 'xml'].includes(extName)) {
      language = 'html'
    } else if (['css', 'less', 'scss'].includes(extName)) {
      language = 'css'
    } else if (extName == 'java') {
      language = 'java'
    } else if (extName == 'md') {
      language = 'markdown'
    } else {
      language = 'editor'
    }
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
}

export default handler