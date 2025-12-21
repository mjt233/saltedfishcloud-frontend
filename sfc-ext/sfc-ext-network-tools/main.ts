import NetworkInterfaceList from './components/NetworkInterfaceList.vue'
import UpnpInfoCard from './components/UpnpInfoCard.vue'
import WolDeviceList from './components/WolDeviceList.vue'


window.bootContext.addProcessor({
  taskName: '注册网络工具',
  execute(app, handler) {
    app.component('WolDeviceList', WolDeviceList)
    app.component('NetworkInterfaceList', NetworkInterfaceList)
    app.component('UpnpInfoCard', UpnpInfoCard)
  },
})