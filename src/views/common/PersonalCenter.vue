<template>
  <div v-if="hasLogin">
    <h1>{{ userInfo.name }}</h1>
  </div>
  <div v-else>
    未登录
  </div>
</template>

<script setup lang="ts">
const userInfo = context.session.value.user
const hasLogin = ConditionFunction.hasLogin(context)
</script>

<script lang="ts">
import { defineComponent } from 'vue'
import { context } from '@/core/context'
import { ConditionFunction } from '@/core/helper/ConditionFunction'
export default defineComponent({
  name: 'PersonalCenter'
})
</script>