<template>
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
    <user-card
      v-ripple
      class="header-user-card"
      :uid="session.user.id"
      :name="session.user.name"
      style="margin:0 16px 0 12px;"
      @click="userCardClick()"
    />
  </v-app-bar>

  <!-- 侧边抽屉 -->
  <v-navigation-drawer v-model="showDrawer" :class="{'bg-drawer': enabledBg}">
    <template #prepend>

      <!-- 抽屉菜单顶部图 -->
      <!-- <img :src="menuObj.backgroundImg" style="width: 100%"> -->
    </template>
    <!-- 抽屉菜单列表本体 -->
    <v-list class="main-menu-list">
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
              color="primary"
              :value="item.route"
              @click="menuClick(item, $event)"
            >
              <template #prepend>
                <!-- 菜单图标 -->
                <v-icon v-if="item.icon" :icon="item.icon" color="primary" />
              </template>

              <!-- 菜单文本 -->
              {{ item.title }}
            </v-list-item>
          </template>
        </template>
      </template>
    </v-list>
  </v-navigation-drawer>

  <!-- 功能视图路由 -->
  <v-main :class="{'bg-main-view': enabledBg}">
    <div class="main-body">
      <router-view />
    </div>
  </v-main>
</template>

<script setup lang="ts">
// import UserCard from 'sfc-common/components/common/UserCard.vue'
// import DarkSwitch from 'sfc-common/components/common/DarkSwitch.vue'
import { fileUploadTaskManager } from 'sfc-common/core/serivce/FileUpload'
import { enabledBg, bgUrl, bgOperacity, menuOperacity, bgSize } from 'sfc-common/core/context/mainBgAttr'
const menuObj = context.menu.value.mainMenu
const uploadingExecutor = fileUploadTaskManager.getAllExecutor()
const showDrawer = ref()

const session = context.session

const userCardClick = () => {
  if (!ConditionFunction.hasLogin(context)) {
    if(context.routeInfo.value.curr?.path != '/login') {
      SfcUtils.openLoginDialog()
      // context.routeInfo.value.router?.replace('/login')
    }
  } else if (context.routeInfo.value.curr?.path != '/personalCenter') {
    context.routeInfo.value.router?.push('/personalCenter')
  }
}
</script>

<script lang="ts">
import { ref, defineComponent, ToRefs } from 'vue'
import { AppContext, context, MenuItem } from 'sfc-common/core/context/'
import { ConditionFunction } from 'sfc-common/core'
import SfcUtils from 'sfc-common/utils/SfcUtils'

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

<style lang="scss">
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

.bg-drawer {
  background: rgba(var(--v-theme-background), v-bind(menuOperacity))
}
@media (max-width: 1279px) {
  .bg-drawer {
    background: rgba(var(--v-theme-background), 1)
  }
}

.main-menu-list {
  background: none;
}
</style>

<style scoped lang="scss">

.header-user-card {
  cursor: pointer;
  display: flex;
  align-items: center;
  height: 100%;
  padding-left: 6px;
  padding-right: 6px;
}

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
    pointer-events: none;
  }
}
</style>