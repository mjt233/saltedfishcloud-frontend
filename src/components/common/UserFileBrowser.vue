<template>
  <!-- 当访问公共网盘 或 已登录用户访问非公共网盘 -->
  <div v-if="uid == 0 || (uid != 0 && session.user.id != 0)">
    <file-browser
      ref="browser"
      :path="path"
      :file-system-handler="handler"
      :read-only="readOnly"
      :uid="uid"
      :top-buttons="context.menu.value.fileBrowserBtn"
      auto-compute-height
      @update:path="emits('update:path', $event)"
    >
      <template #top-bar>
        <text-input style="min-width: 210px;margin-right: 6px;" placeholder="搜索文件" hide-details />
      </template>
    </file-browser>
  </div>
  <div v-else class="d-flex justify-center">
    <v-card
      color="background"
      title="访问受限"
      max-width="640px"
      width="100%"
    >
      <v-card-content>
        <p style="margin-bottom: 16px">
          私人网盘功能需要登录账号才能使用捏~φ(゜▽゜*)♪
        </p>
        <v-btn color="primary" @click="login">
          立即登录
        </v-btn>
      </v-card-content>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import FileBrowser from '@/components/common/FileBrowser.vue'
import { FileSystemHandlerFactory } from '@/core/serivce/FileSystemHandler'
import TextInput from '@/components/common/TextInput.vue'
const props = defineProps({
  uid: {
    type: [Number, String],
    default: 0
  },
  path: {
    type: String,
    default: '/'
  }
})
const session = context.session
const browser = ref()
const emits = defineEmits(['update:path'])
const handler = computed(() => {
  return FileSystemHandlerFactory.getFileSystemHandler(ref(props.uid))
})

const login = () => {
  SfcUtils.openLoginDialog()
}

const readOnly = computed(() => {
  // 管理员用户 或 普通用户访问自己的网盘 时关闭只读
  return !(session.value.user.role == 'admin' || (props.uid != 0 && props.uid == session.value.user.id))
})
</script>

<script lang="ts">
import { context } from '@/core/context'
import { computed, defineComponent, onMounted, Ref, ref, watch } from 'vue'
import SfcUtils from '@/utils/SfcUtils'
export default defineComponent({
  name: 'UserFileBrowser'
})
</script>