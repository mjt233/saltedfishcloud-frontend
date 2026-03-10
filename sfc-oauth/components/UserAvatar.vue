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
    return '/api/static/defaultAvatar.png'
  }
  
  // 根据用户名构造头像获取url
  let url = appendPath(axiosInst.defaults.baseURL || '', user.getAvatar(props.name, props.uid).url)

  // 如果是刷新操作，则追加时间戳
  if (timestamp.value) {
    if (url.includes('?')) {
      url += '&'
    } else {
      url += '?'
    }
    url += 't=' + timestamp.value
  }
  return url
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, computed } from 'vue'
import { axiosInst } from '../core'
import { appendPath } from '../StringUtils'
import user from 'sfc-common/api/user'

export default defineComponent({
  name: 'UserAvatar'
})
</script>