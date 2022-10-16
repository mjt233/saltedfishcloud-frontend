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
    <template #prepend>

      <!-- 抽屉菜单顶部图 -->
      <!-- <img :src="menuObj.backgroundImg" style="width: 100%"> -->
    </template>
    <!-- 抽屉菜单列表本体 -->
    <v-list bg-color="background">
      <template v-for="(group) in menuObj.group" :key="group.id">
        <template v-if="!group.renderOn || group.renderOn(context)">

          <!-- 副标题 -->
          <v-list-subheader>{{ group.name }}</v-list-subheader>

          <!-- 菜单项 -->
          <template v-for="(item) in group.items">
            <v-list-item
              v-if="item.renderOn == undefined ? true : item.renderOn(context)"
              :key="item.id"
              :active="$route.path == item.route"
              active-color="primary"
              :value="item.route"
              @click="menuClick(item, $event)"
            >
              <!-- 菜单图标 -->
              <v-list-item-avatar v-if="item.icon" start>
                <v-icon :icon="item.icon" color="primary" />
              </v-list-item-avatar>

              <!-- 菜单文本 -->
              {{ item.title }}
            </v-list-item>
          </template>
        </template>
      </template>
    </v-list>
  </v-navigation-drawer>

  <!-- 功能视图路由 -->
  <v-main>
    <div class="main-body">
      <router-view />
    </div>
  </v-main>
</template>

<script setup lang="ts">
import UserCard from '@/components/common/UserCard.vue'
import DarkSwitch from '@/components/common/DarkSwitch.vue'
import { fileUploadTaskManager } from '@/core/serivce/FileUpload'
const menuObj = context.menu.value.mainMenu
const uploadingExecutor = fileUploadTaskManager.getAllExecutor()
const showDrawer = ref()

const session = context.session
</script>

<script lang="ts">
import { ref, defineComponent, ToRefs } from 'vue'
import { AppContext, context, MenuItem } from '@/core/context/'

export default defineComponent({
  name: 'CommonIndex',
  methods: {
    menuClick(menuItem: MenuItem<ToRefs<AppContext>>, event: MouseEvent) {
      if (menuItem.action) {
        menuItem.action(context)
      }
      if (menuItem.route && this.$route.path != menuItem.route) {
        this.$router.push(menuItem.route)
      }
    }
  }
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