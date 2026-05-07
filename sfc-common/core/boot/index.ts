import API from 'sfc-common/api'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { EventNameConstants } from '../constans/EventName'
import { BgOption, getContext, registerFileAttributeSection } from '../context'
import { ConditionFunction } from '../helper/ConditionFunction'
import { ConfigNodeModel } from 'sfc-common/model'
import { buildExtensionManager } from '../serivce/Extension'
import { bootContext } from './BootCore'
import { CreateMountPointFormVue } from 'sfc-common/components/common/MountPoint'
import MountPointSyncFileRecordForm from 'sfc-common/components/form/MountPointSyncFileRecordForm.vue'
import { h } from 'vue'
import { VBtn } from 'vuetify/components'

let isValidSessionSuccess = false

bootContext
  .addProcessor({
    taskName: '获取服务器信息',
    async execute() {
      const data = (await SfcUtils.request(API.sys.getFeature())).data
      Object.assign(getContext().feature.value, data)
      if (data.bgMain) {
        getContext().bg.value.main = data.bgMain
      }
      // 默认开启黑暗模式
      if (data.darkTheme) {
        getContext().theme.value = 'dark'
      }
      // 监听系统配置变更，实时更新背景图
      getContext().eventBus.value.on(EventNameConstants.SYS_CONFIG_CHANGE, (changeList: ConfigNodeModel[]) => {
        const config = changeList.find(e => e.name == 'sys.bg.main')
        if (config) {
          const newOption: BgOption = JSON.parse(config.value)
          getContext().bg.value.main = newOption
          getContext().feature.value.bgMain = newOption
        }
      })
    }
  })
  .addProcessor({
    taskName: '注册默认的文件属性扩展',
    async execute() {
      // 挂载点信息扩展
      registerFileAttributeSection({
        id: 'mount-point-info',
        resolve(ctx) {
          // 单选了挂载点文件夹时可见
          if (ctx.selectFileList.length !== 1 || !ctx.selectFileList[0].mountId) {
            return null
          }
          let formNodeRef: InstanceType<typeof CreateMountPointFormVue> | null = null
          const mountId = ctx.selectFileList[0].mountId
          return {
            title: '挂载点信息',
            component: () => h(CreateMountPointFormVue, {
              dataId: mountId,
              readOnly: true,
              ref: (inst) => { formNodeRef = inst as InstanceType<typeof CreateMountPointFormVue> }
            }, {
              append: () => h(VBtn, {
                color: 'primary',
                block: true,
                onclick: () => {
                  const dialogInst = SfcUtils.openComponentDialog(CreateMountPointFormVue, {
                    title: '修改挂载点信息',
                    props: {
                      dataId: mountId,
                      readOnly: false
                    },
                    extraDialogOptions: {
                      maxWidth: '640px'
                    },
                    onConfirm: async() => {
                      const form = dialogInst.getInstAsForm()
                      const oldIsProxy = formNodeRef?.formData.isProxyStoreRecord
                      const newIsProxy = form.getFormData().isProxyStoreRecord
                      const res = await form.submit()
                      if (!res.success) {
                        return false
                      }
                      SfcUtils.snackbar('已修改')
                      
                      // 刷新文件属性中扩展的挂载点信息
                      formNodeRef?.actions.loadData()
                      // 刷新文件列表
                      ctx.modelHandler.refresh()
                      
                      // 修改了挂载点的“是否委托存储记录”为true时，提示用户是否立即同步一次存储记录
                      if (!oldIsProxy && newIsProxy) {
                        const syncDialog = SfcUtils.openComponentDialog(MountPointSyncFileRecordForm, {
                          title: '同步存储记录',
                          props: {
                            id: mountId
                          },
                          onConfirm: async() => {
                            const syncForm = syncDialog.getInstAsForm()
                            const syncRes = await SfcUtils.loadingDialogTask(
                              { msg: '正在同步文件记录' },
                              () => syncForm.submit()
                            )
                            if (syncRes.success) {
                              SfcUtils.snackbar('同步成功')
                              return true
                            } else {
                              SfcUtils.alert(syncRes.err + '', '同步出错')
                            }
                            return false
                          }
                        })
                      }
                      
                      return true
                    }
                  })
                }
              }, () => '修改挂载点信息')
            })
          }
        },
      })
    }
  })
  .addProcessor({
    taskName: '验证登录状态',
    async execute() {
      const session = getContext().session.value
      session.loadToken()
      try {
        if (ConditionFunction.hasLogin(getContext())) {
          const userInfo = ( await SfcUtils.request(API.user.getUserInfo())).data.data
          session.setUserInfo(userInfo)
          isValidSessionSuccess = true
        }
      } catch (err) {
        console.log('登录已过期')
        getContext().session.value.setToken('')
        return false
      }
    },
    onFinish() {
      if (isValidSessionSuccess) {
        SfcUtils.snackbar(`欢迎回来，${getContext().session.value.user.name}`, 1500, { showClose: false, outClose: true })
      }
    }
  })
  .addProcessor({
    taskName: '加载插件',
    async execute(app, handler) {
      return buildExtensionManager({app, bootContextHandler: handler}).mountAll()
    }
  })
  .addProcessor({
    taskName: '清理',
    onFinish(app, handler) {
      const bootDom = document.querySelector('#boot-info') as HTMLElement
      bootDom.classList.add('hide')
      setTimeout(() => {
        bootDom.remove()
      }, 250)
    }
  })



export default bootContext