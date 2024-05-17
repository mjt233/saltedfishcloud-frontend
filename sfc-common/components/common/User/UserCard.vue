<template>
  <div>
    <slot name="prepend" />
    <user-avatar :uid="uid" :name="name" :transition="false" />
    <span style="font-size: 14px;">{{ uid == 0 ? '[游客]' : name }}</span>
    <slot name="append" />
  </div>
</template>

<script setup lang="ts">
import UserAvatar from './UserAvatar.vue'
const props = defineProps({
  uid: {
    type: [Number, String],
    default: 0
  },
  name: {
    type: String,
    default: '[游客]'
  }
})
</script>

<script lang="ts">
import { defineComponent, computed, defineProps } from 'vue'
export default defineComponent({
  name: 'UserCard'
})
</script>