<template>
  <v-app :theme="theme">
    <!-- 顶部栏 -->
    <v-app-bar>
      <v-app-bar-nav-icon @click="showDrawer = !showDrawer" />
      <v-toolbar-title>{{ context.appTitle.value }}</v-toolbar-title>
      <v-spacer />
    </v-app-bar>

    <!-- 侧边抽屉 -->
    <v-navigation-drawer v-model="showDrawer" color="background">
      <template #prepend>

        <!-- 抽屉菜单顶部图 -->
        <img :src="menuObj.backgroundImg" style="width: 100%">
      </template>

      <!-- 抽屉菜单列表本体 -->
      <v-list bg-color="background">
        <template v-for="(item, i) in context.menu.value.items" :key="i">

          <!-- 副标题 -->
          <template v-if="item.isSubHeader">
            <v-list-subheader>{{ item.title }}</v-list-subheader>
          </template>

          <!-- 菜单项 -->
          <template v-else>
            <v-list-item
              v-if="item.renderOn == undefined ? true : item.renderOn(context)"
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
      </v-list>
    </v-navigation-drawer>

    <!-- 功能视图路由 -->
    <v-main>
      <div class="main-body">
        <router-view />
      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
const theme = context.theme
const menuObj = context.menu
const showDrawer = ref()

</script>

<script lang="ts">
import { ref, defineComponent } from 'vue'
import { context, MenuItem } from '@/core/context/'
export default defineComponent({
  name: 'CommonIndex',
  methods: {
    menuClick(menuItem: MenuItem, event: MouseEvent) {
      if (menuItem.route) {
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
.main-body {
  padding: 8px 16px;
}
</style>