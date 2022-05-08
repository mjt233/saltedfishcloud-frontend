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
      color="background"
    >
      <!-- 抽屉菜单列表 -->
      <v-list bg-color="background">
        <template
          v-for="(item, i) in commonMenu"
          :key="i"
        >
          <template v-if="item.isSubHeader">
            <v-list-subheader>{{ item.title }}</v-list-subheader>
          </template>
          <template v-else>
            <v-list-item
              :active="$route.path == item.route"
              active-color="primary"
              :value="item.route"
              @click="menuClick(item, $event)"
            >
              <v-list-item-avatar
                v-if="item.icon"
                start
              >
                <v-icon
                  :icon="item.icon"
                  color="primary"
                />
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
const theme = ref(context.theme)
const showDrawer = ref()
const commonMenu = ref(
  context.commonMenu.map((e) => {
    e.value = e.route
    return e
  })
)
</script>

<script lang="ts">
import { ref, defineComponent } from 'vue'
import { context, MenuItem } from '@/core/context/'
export default defineComponent({
  name: 'CommonIndex',
  mounted() {
    console.log(this.$route.path)
  },
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
</style>