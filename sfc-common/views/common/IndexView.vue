<template>
  <!-- 顶部栏 -->
  <v-app-bar :color="getContext().theme.value == 'dark' ? 'surface': 'primary'">
    <v-app-bar-nav-icon @click="showDrawer = !showDrawer" />
    <v-toolbar-title>{{ getContext().appTitle.value }}</v-toolbar-title>
    <v-spacer />

    <!-- 文件上传列表显示/隐藏切换开关 -->
    <v-tooltip
      :model-value="isShowFileAddCount"
      location="bottom"
      :open-on-hover="false"
      :open-on-click="false"
      :no-click-animation="true"
    >
      <template #activator="{ props }">
        <v-btn
          v-ripple
          v-bind="props"
          icon
          style="border-radius: 50%;"
          @click="getContext().visiableWindows.value.uploadList = !getContext().visiableWindows.value.uploadList"
        >
          <v-badge v-if="uploadingExecutor.length != 0" dot color="error">
            <v-icon size="24" icon="mdi-swap-vertical" />
          </v-badge>
          <v-icon v-else icon="mdi-swap-vertical" />
        </v-btn>
      </template>
      <span>已添加 {{ showFileAddCount }} 个文件</span>
    </v-tooltip>
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
  <v-navigation-drawer v-model="showDrawer" class="bg-drawer">
    <template #prepend>

      <!-- 抽屉菜单顶部图 -->
      <!-- <img :src="menuObj.backgroundImg" style="width: 100%"> -->
    </template>
    <!-- 抽屉菜单列表本体 -->
    <v-list nav density="compact">
      <template v-for="(group) in menuObj.group" :key="group.id">
        <template v-if="!group.renderOn || group.renderOn(getContext())">

          <!-- 副标题 -->
          <v-list-subheader>{{ group.name }}</v-list-subheader>
          
          <!-- 菜单项 -->
          <template v-for="(item) in group.items">
            <v-list-item
              v-if="item.renderOn == undefined ? true : item.renderOn(getContext())"
              :key="item.id"
              style="font-size: 14px;"
              :active="(item.route == '/' && $route.path == '/') || ( item.route != null && item.route != '/' && $route.path.startsWith(item.route))"
              color="primary"
              :value="item.route"
              @click="menuClick(item, $event)"
            >
              {{ item.title }}
              <template #prepend>
                <!-- 菜单图标 -->
                <v-icon v-if="item.icon" :icon="item.icon" color="primary" />
              </template>
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
import { FileUploadExecutor, fileUploadTaskManager } from 'sfc-common/core/serivce/FileUpload'
import { enabledBg, menuOperacity, enabledGlass } from 'sfc-common/core/context/mainBgAttr'
const menuObj = getContext().menu.value.mainMenu
const uploadingExecutor = fileUploadTaskManager.getAllExecutor()
const showDrawer = ref()

const session = getContext().session
// 未提示的文件添加数量
let fileAddCount = 0
// 当前显示的添加文件的数量
let showFileAddCount = ref(0)
// 是否需要显示添加的文件数量
let isShowFileAddCount = ref(false)

const userCardClick = () => {
  if (!ConditionFunction.hasLogin(getContext())) {
    if(getContext().routeInfo.value.curr?.path != '/login') {
      SfcUtils.openLoginDialog()
      // context.routeInfo.value.router?.replace('/login')
    }
  } else if (getContext().routeInfo.value.curr?.path != '/personalCenter') {
    getContext().routeInfo.value.router?.push('/personalCenter')
  }
}

let tipTimer: any

// 将已记录的文件添加数量显示在界面上
const showFileAddCountTip = MethodInterceptor.createThrottleProxyFunc(() => {
  // 固化需要显示的添加数量
  showFileAddCount.value = fileAddCount
  isShowFileAddCount.value = true

  // 清空待显示数量
  fileAddCount = 0

  // 移除隐藏定时器，防止多次触发间隔太短导致刚更新的文本很快消失
  tipTimer && clearTimeout(tipTimer)

  // 先延迟关闭文本提示，再清空显示数量，防止提示关闭过渡动画期间数量变成0显示
  tipTimer = setTimeout(() => {
    isShowFileAddCount.value = false
    tipTimer = setTimeout(() => {
      showFileAddCount.value = 0
      tipTimer = null
    }, 300)
  }, 3000)
}, { alawayDelay: true, delay: 100 })

function fileUploadAddListener(e: FileUploadExecutor) {
  if (getContext().visiableWindows.value.uploadList) {
    // 已经打开了文件传输对话框期间不记录 不触发气泡提示
    return
  }
  fileAddCount++
  showFileAddCountTip()
}

onMounted(() => fileUploadTaskManager.addEventListener('add', fileUploadAddListener))
onUnmounted(() => fileUploadTaskManager.removeEventListener('add', fileUploadAddListener))
</script>

<script lang="ts">
import { ref, defineComponent, ToRefs, onMounted, onUnmounted } from 'vue'
import { AppContext, getContext, MenuItem } from 'sfc-common/core/context/'
import { ConditionFunction } from 'sfc-common/core'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { MethodInterceptor } from 'sfc-common/utils'



export default defineComponent({
  name: 'CommonIndex',
  methods: {
    menuClick(menuItem: MenuItem<ToRefs<AppContext>>, event: MouseEvent | KeyboardEvent) {
      if (menuItem.action) {
        menuItem.action(getContext())
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
.top-bar-welcome {
  position: absolute;
  bottom: 0px;
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
</style>