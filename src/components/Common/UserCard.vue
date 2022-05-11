<template>
  <div>
    <v-avatar size="32" style="margin-right: 12px;">
      <v-img :src="avatarUrl" :transition="false" />
    </v-avatar>
    <span style="font-size: 14px;">{{ uid == 0 ? '[游客]' : name }}</span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  uid: {
    type: Number,
    default: 0
  },
  name: {
    type: String,
    default: '[游客]'
  }
})

const avatarUrl = computed(() => {
  if (props.uid == 0) {
    return context.defaultAvatar.value
  } else {
    return axios.defaults.baseURL + API.user.getAvatar(props.name).url
  }
})
</script>

<script lang="ts">
import { defineComponent, computed, defineProps } from 'vue'
import { context } from '@/core/context'
import API from '@/api'
import axios from '@/plugins/axios'
export default defineComponent({
  name: 'UserCard'
})
</script>