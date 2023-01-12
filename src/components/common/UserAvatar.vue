<template>
  <v-avatar
    :size="size"
    style="margin-right: 12px;"
    :transition="transition"
  >
    <v-img
      class="avatar"
      :src="avatarUrl"
      :transition="false"
      cover
    />
  </v-avatar>
</template>

<script setup lang="ts">
const props = defineProps({
  name: {
    type: String,
    default: 'public'
  },
  uid: {
    type: [Number, String],
    default: 0
  },
  size: {
    type: [Number, String],
    default: 32
  },
  transition: {
    type: Boolean,
    default: true
  }
})
const timestamp = ref('')
const avatarUrl = computed(() => {

  // uid为0 公共用户或未登录 显示默认头像
  if (props.uid == 0) {
    return context.defaultAvatar.value
  }
  
  // 根据用户名构造头像获取url
  let url = StringUtils.appendPath(SfcUtils.axios.defaults.baseURL || '', API.user.getAvatar(props.name, props.uid).url)

  // 如果是刷新操作，则追加时间戳
  if (timestamp.value) {
    url += '?t=' + timestamp.value
  }
  return url
})

const refresh = () => {
  timestamp.value = new Date().getTime().toString()
}

// 监听到uid变化，消除refresh强制刷新标志
watch(() => props.uid, () => {
  refresh()
})

const avatarUpdateListener = (e: any) => {
  const uid = e.uid
  if(uid == props.uid) {
    refresh()
  }
}
onMounted(() => {

  // 监听到用户头像更新事时，刷新头像
  context.eventBus.value.on(EventNameConstants.AVATAR_UPDATE, avatarUpdateListener)
})

onUnmounted(() => {

  // 移除监听
  context.eventBus.value.off(EventNameConstants.AVATAR_UPDATE, avatarUpdateListener)
})
</script>

<script lang="ts">
import API from '@/api'
import SfcUtils from '@/utils/SfcUtils'
import { StringUtils } from '@/utils/StringUtils'
import { defineComponent, computed, onMounted, ref, watch, onUnmounted } from 'vue'
import { context } from '@/core/context'
import { EventNameConstants } from '@/core/constans/EventName'

export default defineComponent({
  name: 'UserAvatar'
})
</script>

<style lang="scss" scoped>
.avatar {
  width: 100%;
  height: 100%;
}
</style>