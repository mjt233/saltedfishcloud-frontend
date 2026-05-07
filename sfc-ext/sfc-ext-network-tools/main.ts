import NetworkInterfaceList from './components/NetworkInterfaceList.vue'
import UpnpDeviceSelector from './components/UpnpDeviceSelector.vue'
import UpnpInfoCard from './components/UpnpInfoCard.vue'
import WolDeviceList from './components/WolDeviceList.vue'
import { Upnp } from './model'
import { NwtApi } from './api'

// 注册Vue组件
window.bootContext.addProcessor({
  taskName: '注册网络工具',
  execute(app, handler) {
    app.component('WolDeviceList', WolDeviceList)
    app.component('NetworkInterfaceList', NetworkInterfaceList)
    app.component('UpnpInfoCard', UpnpInfoCard)
  },
})

const mediaExtNameSet = new Set([
  'mp4','mkv','avi','mov','wmv','flv','webm','mpg','mpeg','m4v','3gp','vob','ts','rm','rmvb','asf','ogv','divx','xvid','h264','h265','hevc','swf','f4v','mts','m2ts','qt','mpv','mpe','m1v','m2v','3gpp','3g2','tp','mxf','dv','cam','m4p','m4b','vc1','anim','wm','ram','mpeg4','mpg4','mk3d','webm','ogv',
  'jpg','jpeg','png','gif','bmp',
  'wav','mp3','ogg','flac','ape','acc','m4a'
])

function isMedia(fileName: string) {
  const s = fileName.split('.')
  if (s.length == 1) {
    return false
  }
  const extName = s.pop() as string
  return mediaExtNameSet.has(extName)
}

// 注册菜单
const context = window.context
context.menu.value.fileListMenu.push({
  name: '投屏',
  id: 'nwt',
  items: [
    {
      title: '投屏',
      id: 'nwt-cast-media',
      icon: 'mdi-cast-variant',
      renderOn(ctx) {
        return ctx.selectFileList.length == 1 && context.session.value.user.role == 'admin' && isMedia(ctx.selectFileList[0].name)
      },
      action(ctx) {
        const inst = window.SfcUtils.openComponentDialog(UpnpDeviceSelector, {
          props: {
            deviceType: ['urn:schemas-upnp-org:device:MediaRenderer:1'],
            async onSelect(dev: Upnp.UpnpDevice) {
              const SfcUtils = window.SfcUtils
              inst.beginLoading()
              try {
                const urlStr = ctx.getFileUrl(ctx.selectFileList[0])
                if (!urlStr) {
                  throw new Error('无法创建该文件URL')
                }
                const url = new URL(urlStr)
                if(!url.searchParams.get('token')) {
                  url.searchParams.set('token', context.session.value.token)
                }
                await SfcUtils.request(NwtApi.UPnP.castMedia(dev.describe.device.udn, url.toString()))
                SfcUtils.alert('投屏成功')
                inst.close()
              } catch(e) {
                SfcUtils.alert('投屏失败: ' + e)
              } finally {
                inst.closeLoading()
              }
            }
          },
          title: '多媒体投屏',
          showConfirm: false
        })
      },
    }
  ]
})