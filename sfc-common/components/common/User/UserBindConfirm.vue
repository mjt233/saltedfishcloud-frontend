<template>
  <div class="d-flex align-center flex-column justify-center">
    <div class="mb-10">
      下面的咸鱼云账号即将与关联第三方平台账号进行关联，是否确认？
    </div>
    <div class="d-flex">
      <div class="align-center d-flex flex-column justify-center">
        <template v-if="platformUser?.avatarUrl">
          <img :src="platformUser.avatarUrl" style="width: 32px;height: 32px;border-radius: 50%;">
        </template>
        <CommonIcon v-else :icon="platformIcon" :size="32" />
        <span class="tip">{{ platformName }}</span>
      </div>
      <div class="d-flex align-center" style="margin: 0 12px">
        <div style="width: 32px;height: 1px;background-color: #666666;" />
        <CommonIcon icon="mdi-link-variant" color="success" />
        <div style="width: 32px;height: 1px;background-color: #666666;" />
      </div>
      <div class="align-center d-flex flex-column justify-center">
        <UserAvatar style="margin: 0;" :name="bindUser?.user" :uid="bindUser?.id" />
        <span class="tip">{{ bindUser?.user }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  /**
   * 待绑定的咸鱼云网盘用户
   */
  bindUser: {
    type: Object as PropType<RawUser>,
    default: undefined
  },
  /**
   * 将要绑定的第三方平台用户信息
   */
  platformUser: {
    type: Object as PropType<ThirdPartyPlatformUser>,
    default: undefined
  },

  /**
   * 第三方平台用户名称
   */
  platformName: {
    type: String,
    default: undefined
  },

  /**
   * 第三方平台图标
   */
  platformIcon: {
    type: String,
    default: undefined
  }
})
</script>

<script lang="ts">
import { IdType, RawUser, ThirdPartyPlatformUser } from 'sfc-common/model'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, Prop } from 'vue'
import { CommonIcon, UserAvatar } from 'sfc-common/components'

export default defineComponent({
  name: 'UserBindConfirm'
})
</script>