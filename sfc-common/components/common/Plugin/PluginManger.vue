<template>
  <div style="margin-top: 12px">
    <LoadingMask :loading="loading" />
    <div class="header">
      <VBtn color="primary" @click="selectUploadFile">
        <CommonIcon icon="mdi-plus" /> 上传插件
      </VBtn>
      <VBtn style="margin-left: 12px" @click="restart">
        <CommonIcon icon="mdi-restart" />
        重启
      </VBtn>
    </div>
    
    <GridContainer :width="360">
      <PluginInfoCard
        v-for="item in pluginList"
        :key="item.name"
        :plugin-info="item"
        :read-only="false"
        @delete="actions.deletePlugin"
      />
    </GridContainer>
  </div>
</template>

<script setup lang="ts">
const loadingManager = new LoadingManager()
const loading = loadingManager.getLoadingRef()
const pluginList = ref([]) as Ref<PluginInfo[]>

const selectUploadFile = async() => {
  const file = await FileUtils.openFileDialog(false, '.jar')
  actions.uploadPlugin(file[0])
}

const restart = async() => {
  await SfcUtils.confirm('确定要重启咸鱼云服务吗？', '重启确认')
  doRestart()
}

const doRestart = async() => {

  await actions.sendRestart()
  let finish = false
  const loadingInst = SfcUtils.openComponentDialog(LoadingDialog, {
    title: '',
    props: {
      msg: '正在重启'
    },
    extraDialogOptions: {
      hideBtn: true,
      width: '280px'
    },
    fullscreen: false,
    persistent: true
  })
  while(!finish) {
    try {
      await SfcUtils.sleep(1000)
    
      const ret = await SfcUtils.request(API.sys.getError())
      if (ret.data && ret.data.length) {
        const component = () => [
          h('div', {}, '启动失败，是否重试？'),
          h('div', {}, '错误信息如下：'),
          h('hr', { style: 'margin: 12px'}),
          h('pre', {}, ret.data)
        ]
        SfcUtils.openComponentDialog(component, {
          title: '启动失败',
          persistent: true,
          fullscreen: true,
          onConfirm() {
            doRestart()
            return true
          }
        })
      } else {
        location.reload()
      }
      finish = true
    } catch (ignore) {}
  }
  loadingInst.doCancel()
}

const actions = MethodInterceptor.createAsyncActionProxy({
  /**
   * 加载插件列表
   */
  async loadList() {
    pluginList.value = (await SfcUtils.request(API.plugin.listAvailablePlugins())).data.data
    return pluginList.value
  },
  /**
   * 删除插件
   * @param plugin 插件信息
   */
  async deletePlugin(plugin: PluginInfo) {
    await SfcUtils.request(API.plugin.deletePlugin(plugin.name))
    SfcUtils.snackbar('删除成功')
    await actions.loadList()
  },
  /**
   * 发送重启系统请求
   */
  async sendRestart() {
    await SfcUtils.request(API.admin.sys.restart())
  },
  /**
   * 上传插件
   * @param file 插件文件
   */
  async uploadPlugin(file: File) {
    // 打开上传进度对话框
    const dialogProps = reactive({
      msg: '正在上传...'
    })
    const inst = SfcUtils.openComponentDialog(LoadingDialog, {
      showCancel: false,
      showConfirm: false,
      persistent: true,
      extraDialogOptions: {
        hideBtn: true
      },
      props: dialogProps
    })
    const config = API.plugin.uploadPlugin(file)
    config.onUploadProgress = (e: Prog) => {
      dialogProps.msg = '正在上传...' + ((e.loaded / e.total) * 100).toFixed(1) + '%'
    }

    try {
      const ret = await SfcUtils.request(config)
      SfcUtils.sleep(250).then(() => {
        let isConfirm = false
        // 上传完成后预览插件信息并确认
        SfcUtils.openComponentDialog(PluginInfoCard, {
          title: '安装确认',
          persistent: true,
          props: {
            pluginInfo: ret.data.data,
            readOnly: true,
            style: {
              width: '100%',
              paddingBottom: '12px'
            }
          },
          extraDialogOptions: {
            width: '480px'
          },
          async onCancel() {
            if (!isConfirm) {
              await SfcUtils.confirm('确定取消安装该插件吗？', '确认')
              return true
            } else {
              return true
            }
          },
          async onConfirm() {
            try {
              SfcUtils.beginLoading()
              await SfcUtils.request(API.plugin.installPlugin(ret.data.data.tempId, file.name))
              SfcUtils.snackbar('安装成功')
              actions.loadList()
              isConfirm = true
              return true
            } catch (err) {
              SfcUtils.snackbar(err)
              return false
            } finally {
              SfcUtils.closeLoading()
            }
          }
        })
      })
    } finally {
      inst.doCancel()
    }
  }
}, false, loadingManager)

onMounted(actions.loadList)
</script>

<script lang="ts">
import API from 'sfc-common/api'
import { PluginInfo } from 'sfc-common/model'
import FileUtils from 'sfc-common/utils/FileUtils'
import { LoadingManager } from 'sfc-common/utils/LoadingManager'
import { MethodInterceptor } from 'sfc-common/utils/MethodInterceptor'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted, h, reactive } from 'vue'
import { LoadingDialog, PluginInfoCard } from 'sfc-common/components'
import { Prog } from 'sfc-common/utils/FileUtils/FileDataProcess'

export default defineComponent({
  name: 'PluginManager'
})
</script>


<style scoped lang="scss">
.header {
  margin: 16px;
}
</style>