import qs from 'qs'
import { getContext, FileOpenHandler } from 'sfc-common'
import OnlyFfficeHelp from './components/OnlyOfficeHelp.vue'
const ACCEPT_OFFICE_FILE = ['.docx', '.doc', '.xlsx', '.xls', '.ppt', '.pptx', '.pdf', '.hwp', '.wps', '.html', '.odt']

function getOfficeOpenHandler(title: string, isView: boolean, icon: string, id: string) {
  return {
    id: id,
    icon: icon,
    title: title,
    matcher(ctx, files) {
      if (!isView && ctx.readonly) {
        return false
      }
      return ACCEPT_OFFICE_FILE.findIndex(e => files.name.endsWith(e)) != -1
    },
    sort: getContext().fileOpenHandler.value.length,
    action(ctx, files) {
      const param = {
        targetId: ctx.uid,
        path: ctx.path,
        protocol: ctx.protocol,
        isView: isView || ctx.readonly,
        ...ctx.getProtocolParams(),
        name: files.name
      }
      const url = `${location.origin}/api/office/editor?${qs.stringify(param)}`
      window.open(url)
    },
  } as FileOpenHandler
}

window.bootContext.addProcessor({
  taskName: '注册文档组件',
  execute(app, handler) {
    getContext().fileOpenHandler.value.push(getOfficeOpenHandler('文档在线编辑', false, 'mdi-file-document-edit','only-office-edit'))
    getContext().fileOpenHandler.value.push(getOfficeOpenHandler('文档在线预览', true, 'mdi-file-eye-outline', 'only-office-view'))
    app.component('OnlyOfficeHelp', OnlyFfficeHelp)
  },
})