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
        <template v-if="!group.renderOn || group.renderOn()">

          <template v-if="group.items.length == 0">
            <v-list-item
              :key="group.id"
              :title="group.name"
              active-color="primary"
              :active="adminContext.group == group.id"
              :prepend-icon="group.icon"
              @click="adminContext.group = group.id"
            />
          </template>
          <template v-else>
            <v-list-group :value="group.id">
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
const menuObj = context.menu.value.adminMenu
const uploadingExecutor = fileUploadTaskManager.getAllExecutor()
const showDrawer = ref()
const session = context.session

const adminContext: AdminContext = reactive({
  component: undefined,
  group: 'general',
  item: 'overview'
})

const openGroup = ref(['general'])


const itemClick = (group: MenuGroup<AdminContext>, menuItem: MenuItem<AdminContext>) => {
  menuItem.action && menuItem.action(adminContext)
  adminContext.group = group.id
  adminContext.item = menuItem.id
}

const loadView = (groupId: string, itemId: string) => {
  const itemObj = menuObj.find(e => e.id == groupId)?.items.find(e => e.id == itemId)
  itemObj && itemObj.action && itemObj.action(adminContext)
}

onMounted(() => {
  loadView(adminContext.group + '', adminContext.item + '')
})
</script>

<script lang="ts">
import { ref, defineComponent, ToRefs, reactive, onMounted } from 'vue'
import { AdminContext, AppContext, context, MenuGroup, MenuItem } from '@/core/context/'

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