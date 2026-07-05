<template>
  <div class="invalid-data-claim">
    <!-- 用户未登录时，显示提示文字 -->
    <div v-if="!isLogged" class="d-flex justify-center align-center" style="min-height: 200px">
      <EmptyTip text="登录后可查看数据" />
    </div>
    <!-- 用户已登录时，加载 ClaimDataList 组件 -->
    <ClaimDataList v-else />
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent } from 'vue'
import { getContext } from 'sfc-common'
import ClaimDataList from './ClaimDataList.vue'

const context = getContext()

/** 当前用户是否已登录（role 为 public 表示未登录） */
const isLogged = computed(() => context.session.value.user.role !== 'public')
</script>

<script lang="ts">
export default defineComponent({
  name: 'InvalidDataClaim'
})
</script>