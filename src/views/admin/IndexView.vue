<template>
  <!-- 顶部栏 -->
  <v-app-bar color="header">
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
  <v-navigation-drawer v-model="showDrawer" color="background">
    <!-- 抽屉菜单列表本体 -->
    <v-list v-model:opened="openGroup" bg-color="background">
      <template v-for="(group) in menuObj" :key="group.id">
        <template v-if="!group.renderOn || group.renderOn(adminContext)">

          <!-- 没有子项的菜单组，独立存在 -->
          <template v-if="group.items.length == 0">
            <v-list-item
              :key="group.id"
              :title="group.name"
              active-color="primary"
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
                  active-color="primary"
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
  <v-main>
    <div class="main-body">
      <component :is="adminContext.component" v-if="adminContext.component" />
    </div>
  </v-main>
</template>

<script setup lang="ts">
import UserCard from '@/components/common/UserCard.vue'
import DarkSwitch from '@/components/common/DarkSwitch.vue'
import { fileUploadTaskManager } from '@/core/serivce/FileUpload'
const menuObj = getDefaultAdminMenu()
const uploadingExecutor = fileUploadTaskManager.getAllExecutor()
const showDrawer = ref()
const router = useRouter()
const session = context.session

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

/**
 * 执行单独的菜单组动作
 * @param group 菜单组
 */
const groupClick = (group: MenuGroup<AdminContext>) => {
  router.replace(`/admin/${group.id}`)
}

const loadView = (groupId: string, itemId: string) => {
  const groupObj = menuObj.find(e => e.id == groupId)

  const itemObj = groupObj?.items.find(e => e.id == itemId)

  if (groupObj) {
    if(!openGroup.value.find(e => e == groupObj.id)) {
      openGroup.value.push(groupObj.id + '')
    }
  }
  
  if (!itemId && groupObj?.items?.length == 0) {
    openGroup.value = [groupId]
    adminContext.item = ''
    adminContext.group = groupObj.id
    adminContext.component = undefined
    groupObj.action && groupObj.action(adminContext)
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

const loadViewFromRoute = () => {
  const nodes = context.routeInfo.value.curr?.params.configNode as string[]
  let res
  if (!nodes || nodes.length == 0) {
    router.replace('/admin/general/overview')
    return true
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
import { ref, defineComponent, ToRefs, reactive, onMounted, h, watch } from 'vue'
import { AdminContext, AppContext, context, MenuGroup, MenuItem } from '@/core/context/'
import { getDefaultAdminMenu } from '@/core/context/menu/AdminMenu'
import NotFoundTipVue from '@/components/common/NotFoundTip.vue'
import { useRouter } from 'vue-router'
import SfcUtils from '@/utils/SfcUtils'

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
</style>