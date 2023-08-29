<template>
  <loading-mask :loading="loadingManager.getLoadingRef().value" />
  <!-- 顶部栏 -->
  <v-app-bar :color="context.theme.value == 'dark' ? 'surface': 'primary'">
    <v-app-bar-nav-icon @click="showDrawer = !showDrawer" />
    <v-toolbar-title>{{ context.appTitle.value }}</v-toolbar-title>
    <v-spacer />
    <v-btn
      v-ripple
      icon
      style="border-radius: 50%;"
      @click="context.visiableWindows.value.uploadList = !context.visiableWindows.value.uploadList"
    >
      <v-badge v-if="uploadingExecutor.length != 0" dot color="error">
        <v-icon size="24" icon="mdi-swap-vertical" />
      </v-badge>
      <v-icon v-else size="24" icon="mdi-swap-vertical" />
    </v-btn>
    <dark-switch brightness />
    <user-card :uid="session.user.id" :name="session.user.name" style="margin-left: 16px" />
  </v-app-bar>

  <!-- 侧边抽屉 -->
  <v-navigation-drawer v-model="showDrawer" :class="{'bg-admin-drawer': enabledBg}">
    <!-- 抽屉菜单列表本体 -->
    <v-list v-model:opened="openGroup" class="main-menu-list">
      <template v-for="(group) in menuObj" :key="group.id">
        <template v-if="!group.renderOn || group.renderOn(adminContext)">

          <!-- 没有子项的菜单组或只有一个子项，独立存在 -->
          <template v-if="group.items.length == 0 || group.items.length == 1">
            <v-list-item
              :key="group.id"
              :title="group.name"
              color="primary"
              :active="adminContext.group == group.id"
              :prepend-icon="group.icon"
              @click="groupClick(group)"
            />
          </template>
          <!-- 有子项的菜单组 -->
          <template v-else>
            <v-list-group :value="group.id">
              <!-- 菜单组下拉项 -->
              <template #activator="{ props }">
                <v-list-item
                  v-bind="props"
                  :title="group.name"
                  :prepend-icon="group.icon"
                  :active="group.id == adminContext.group"
                />
              </template>
              <!-- 菜单项 -->
              <template v-for="(item) in group.items">
                <v-list-item
                  v-if="item.renderOn == undefined ? true : item.renderOn(adminContext)"
                  :key="item.id"
                  :active="adminContext.item == item.id"
                  color="primary"
                  :prepend-icon="item.icon"
                  :title="item.title"
                  @click="itemClick(group ,item)"
                >
                  <!-- {{ item.title }} -->
                </v-list-item>
              </template>
            </v-list-group>
          </template>

        </template>
      </template>
    </v-list>
  </v-navigation-drawer>

  <!-- 功能视图路由 -->
  <v-main :class="{'bg-main-view': enabledBg}">
    <div class="main-body">
      <component :is="adminContext.component" v-if="adminContext.component" />
    </div>
  </v-main>
  <fixed-btn :hide="hideConfirm" @click="confirmChange" />
</template>

<script setup lang="ts">
import FixedBtn from 'sfc-common/components/common/btn/FixedBtn.vue'
import { UserCard } from 'sfc-common/components'
import DarkSwitch from 'sfc-common/components/common/DarkSwitch.vue'
import { fileUploadTaskManager } from 'sfc-common/core/serivce/FileUpload'
import LoadingMask from 'sfc-common/components/common/LoadingMask.vue'
import { enabledBg, bgUrl, bgOperacity, menuOperacity, bgSize } from 'sfc-common/core/context/mainBgAttr'
const loadingManager = new LoadingManager()
const menuObj = ref([]) as Ref<MenuGroup<AdminContext>[]>
const uploadingExecutor = fileUploadTaskManager.getAllExecutor()
const showDrawer = ref()
const router = useRouter()
const session = context.session
const hideConfirm = ref(true)
let initPromise:Promise<any>

const adminContext: AdminContext = reactive({
  component: undefined,
  group: 'general',
  item: 'overview'
})

/**
 * 当前展开的菜单组
 */
const openGroup = ref(['general'])

/**
 * 菜单项点击
 * @param group 所属菜单组
 * @param menuItem 菜单项
 */
const itemClick = (group: MenuGroup<AdminContext>, menuItem: MenuItem<AdminContext>) => {
  router.replace(`/admin/${group.id}/${menuItem.id}`)
}

const actions = MethodInterceptor.createAsyncActionProxy({
  async loadConfig() {
    const pluginConfigs = (await SfcUtils.request(API.admin.sys.listPluginConfig())).data.data
    return pluginConfigs
  }
}, false, loadingManager)



const nodeMap = {} as {[key: string]: ConfigNodeModel}


/**
 * 菜单初始化操作
 */
const initMenu = async() => {
  const pluginConfigs = await actions.loadConfig()
  // 先获取默认的管理员菜单
  menuObj.value = [...getDefaultAdminMenu()]

  // 再追加动态菜单
  pluginConfigs.filter(pc => {
    return pc.groups.length != 0
  }).forEach(pc => {
    menuObj.value.push(reactive({
      name: pc.alias,
      id: pc.name,
      icon: pc.icon || 'mdi-puzzle',
      items: pc.groups.map(g => {
        g.nodes?.flatMap(e => e.nodes).forEach(e => {
          if (e) {
            e.originValue = e.value
            nodeMap[e.name] = e
          }
        })
        // 默认的点击行为：根据各插件的配置信息，将配置数据装载到config-node-group，并根据nodeChange事件获取参数变更
        return reactive({
          id: g.name,
          title: g.title,
          action(ctx) {
            ctx.component = h(ConfigNodeGroupVue, reactive({
              items: g.nodes,
              onNodeChange(changeInfo: NameValueType) {
                nodeMap[changeInfo.name].value = changeInfo.value
                updateHideConfirm()
              }
            }))
          }
        })
      })
    }))
  })

  // 在末尾补充一个回到前台的菜单
  menuObj.value.push({
    id: 'toFront',
    name: '回到前台',
    icon: 'mdi-home',
    items: [],
    action(ctx) {
      router.push('/')
    }
  })
}

const updateHideConfirm = () => {
  const changeObj = Object.keys(nodeMap).find(nodeName => nodeMap[nodeName].originValue + '' != nodeMap[nodeName].value + '')
  hideConfirm.value = changeObj == undefined
}

const confirmChange = () => {
  const changeList = Object.keys(nodeMap)
    .filter(nodeName => nodeMap[nodeName].originValue + '' != nodeMap[nodeName].value + '')
    .map(nodeName => nodeMap[nodeName])

  const dialogInst = SfcUtils.openComponentDialog(ConfigNodeChangeListVue, {
    props: {
      nodes: changeList
    },
    title: '配置修改确认',
    async onConfirm() {
      dialogInst.beginLoading()
      try {
        await SfcUtils.request(API.admin.sys.batchSetConfig(changeList))
        await initMenu()
        await loadView(adminContext.group as string, adminContext.item as string)
        updateHideConfirm()
        dialogInst.closeLoading()
        SfcUtils.snackbar('修改成功')
        context.eventBus.value.emit(EventNameConstants.SYS_CONFIG_CHANGE, changeList)
        return true
      } catch(err) {
        const msg = err ? err.toString && err.toString() : '未知错误'
        SfcUtils.alert(msg, '系统错误')
        return false
      } finally {
        dialogInst.closeLoading()
      }
    }
  })
}

/**
 * 执行单独的菜单组动作
 * @param group 菜单组
 */
const groupClick = (group: MenuGroup<AdminContext>) => {
  if (group.items.length) {
    router.replace(`/admin/${group.id}/${group.items[0].id}`)
    loadView(group.id + '', group.items[0].id + '')
  } else {
    router.replace(`/admin/${group.id}`)
  }
  
}

const loadView = (groupId: string, itemId: string) => {
  // 搜索一级菜单
  const groupObj = menuObj.value.find(e => e.id == groupId)

  // 搜索二级菜单
  const itemObj = groupObj?.items.find(e => e.id == itemId)

  if (groupObj) {
    if(!openGroup.value.find(e => e == groupObj.id)) {
      openGroup.value.push(groupObj.id + '')
    }
  }
  
  // 若未传入二级菜单id，且一级菜单中不存在二级菜单，则直接加载一级菜单的视图
  if (!itemId && groupObj?.items?.length == 0) {
    openGroup.value = [groupId]
    adminContext.item = ''
    adminContext.group = groupObj.id
    adminContext.component = undefined
    if (groupObj.action) {
      groupObj.action(adminContext)
    } else {
      adminContext.component = h(NotFoundTipVue, {
        text: '页面未配置'
      })
    }
    
    return true
  } else if (groupObj && itemObj) {
    adminContext.group = groupObj.id
    adminContext.item = itemObj.id
    adminContext.component = undefined
    itemObj.action && itemObj.action(adminContext)
    return true
  } else {
    adminContext.component = h(NotFoundTipVue, { text: '找不到该管理页面'})
    return false
  }
}

const loadViewFromRoute = async() => {
  await initPromise
  const nodes = context.routeInfo.value.curr?.params.configNode as string[]
  let res
  if (!nodes || nodes.length == 0) {
    // 未从路由中获取到一级和二级菜单id，则默认加载总览e'e页面
    return loadView('overview', '')
  } else {
    const [groupId, itemId] = nodes
    res = loadView(groupId, itemId)
  }

  if (!res) {
    SfcUtils.snackbar('找不到该管理页面')
    adminContext.group = adminContext.item = ''
    openGroup.value = []
  }
}

onMounted(() => {
  initPromise = initMenu()
  loadView(adminContext.group + '', adminContext.item + '')
  loadViewFromRoute()
})

watch(
  () => router.currentRoute.value,
  () => {
    loadViewFromRoute()
  }
)


</script>

<script lang="ts">
import { ref, defineComponent, reactive, onMounted, h, watch, Ref } from 'vue'
import { AdminContext, context, MenuGroup, MenuItem } from 'sfc-common/core/context/'
import { getDefaultAdminMenu } from 'sfc-common/core/context/menu/AdminMenu'
import NotFoundTipVue from 'sfc-common/components/common/NotFoundTip.vue'
import { useRouter } from 'vue-router'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { MethodInterceptor } from 'sfc-common/utils/MethodInterceptor'
import { LoadingManager } from 'sfc-common/utils/LoadingManager'
import API from 'sfc-common/api'
import ConfigNodeGroupVue from 'sfc-common/components/common/ConfigNode/ConfigNodeGroup.vue'
import { ConfigNodeModel, NameValueType } from 'sfc-common/model'
import ConfigNodeChangeListVue from 'sfc-common/components/common/ConfigNode/ConfigNodeChangeList.vue'
import { EventNameConstants } from 'sfc-common/core/constans/EventName'

export default defineComponent({
  name: 'AdminIndex'
})
</script>

<style>
a {
  text-decoration: none;
}
.main-body>* {
  padding-top: 16px;
}
.top-bar-welcome {
  position: absolute;
  bottom: 0px;
}

.bg-admin-drawer {
  background: rgba(var(--v-theme-background), v-bind(menuOperacity))
}
@media (max-width: 1279px) {
  .bg-admin-drawer {
    background: rgba(var(--v-theme-background), 1)
  }
}

.main-menu-list {
  background: none;
}
</style>

<style scoped lang="scss">
.bg-main-view {
  position: relative;
  background-image: v-bind(bgUrl);
  background-size: v-bind(bgSize);
  background-attachment: fixed;

  &::before {
    content: '';
    position: fixed;
    background: rgba(var(--v-theme-background), v-bind(bgOperacity));
    z-index: 0;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}
</style>
