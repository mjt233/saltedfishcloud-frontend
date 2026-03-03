<template>
  <v-sheet elevation="2">
    <v-tabs v-model="curTab" color="primary">
      <v-tab value="private">
        我的代理
      </v-tab>
      <v-tab v-if="isAdmin" value="public">
        公共代理
      </v-tab>
    </v-tabs>
    <v-divider />
    <div class="pl-3 pr-3">
      
      <v-tabs-window v-model="curTab"> 
        <v-tabs-window-item value="private">
          <ProxyConfig :uid="uid" />
        </v-tabs-window-item>
        <v-tabs-window-item v-if="isAdmin" value="public">
          <ProxyConfig />
        </v-tabs-window-item>
      </v-tabs-window>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
const props = defineProps({})
const curTab = ref('private')

const isAdmin = getContext().session.value.user.role == 'admin'
const uid = getContext().session.value.user.id
</script>

<script lang="ts">
import { getContext } from 'sfc-common/core'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'
import ProxyConfig from './ProxyConfig.vue'

export default defineComponent({
  name: 'ProxyManager'
})
</script>