<template>
  <v-app
    theme="light"
  >
    <v-app-bar color="">
      <v-app-bar-nav-icon />
      <v-toolbar-title>咸鱼云网盘</v-toolbar-title>
      <v-spacer />
    </v-app-bar>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'CommonIndex'
})
</script>