<template>
  <v-app :theme="theme">
    <!-- 顶部栏 -->
    <v-app-bar>
      <v-app-bar-nav-icon @click="showDrawer = !showDrawer" />
      <v-toolbar-title>咸鱼云网盘</v-toolbar-title>
      <v-spacer />
    </v-app-bar>
    
    <!-- 侧边抽屉 -->
    <v-navigation-drawer
      v-model="showDrawer"
    >
      <!-- 抽屉菜单列表 -->
      <v-list>
        <template 
          v-for="(item,i) in commonMenu"
          :key="i"
        >
          <!-- 子标题 -->
          <template v-if="item.isSubHeader">
            <v-list-subheader>{{ item.title }}</v-list-subheader>
          </template>
          <!-- 项目 -->
          <template v-else>
            <v-list-item
              :value="item.route"
            >
              <v-list-item-avatar
                v-if="item.icon"
                start
              >
                <v-icon :icon="item.icon" />
              </v-list-item-avatar>
              {{ item.title }}
            </v-list-item>
          </template>
        </template>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
const theme = ref(GlobalContext.theme)
const showDrawer = ref()
const commonMenu = ref(GlobalContext.commonMenu.map(e => {
  e.value = e.route
  return e
}))
</script>

<script lang="ts">
import { ref, defineComponent } from 'vue'
import GlobalContext from '@/core/context'
export default defineComponent({
  name: 'CommonIndex'
})
</script>