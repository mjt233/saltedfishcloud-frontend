<template>
  <div>
    <LoadingMask :loading="loading" />
    <div class="message-area">
      <div v-for="comment in commentList" :key="comment.id">
        <CommentMessage :comment="comment" />
      </div>
    </div>
    <div ref="sendArea" class="d-flex align-end" style="min-height: 32px">
      <SimpleTextarea
        v-model="content"
        style="min-height: 32px"
        placeholder="友善留言，Ctrl+Enter发送哦~"
        @keyup="keyupHandler"
      />
      <div>
        <VBtn
          style="margin: 0 6px"
          icon="mdi-send"
          flat
          @click="actions.send"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const sendArea = ref() as Ref<HTMLElement>
const props = defineProps({
  topicId: {
    type: [String, Number] as PropType<IdType>,
    default: 0
  },
  initPage: {
    type: Number,
    default: 0
  },
  canSend: {
    type: Boolean,
    default: false
  },
  maxMessageHeight: {
    type: String,
    default: '480px'
  }
})
const loadingManager = new LoadingManager()
const content = ref('')
const loading = loadingManager.getLoadingRef()
const actions = MethodInterceptor.createAsyncActionProxy({
  async loadData(page?: number, append?: boolean) {
    const list = (await SfcUtils.request(API.comment.listByTopicId(props.topicId, page))).data.data.content
    if (append) {
      list.forEach(e => {
        commentList.value.push(e)
      })
    }
    return list
  },
  async send() {
    if (props.topicId != 0) {
      SfcUtils.alert('暂不支持指定话题评论')
      return
    }
    if (!content.value?.length) {
      SfcUtils.alert('内容不能为空( •̀ ω •́ )y')
      return
    }
    try {
      await SfcUtils.request(API.comment.sendAnonymousComment(content.value))
      commentList.value = await this.loadData(0, false)
      content.value = ''
      SfcUtils.snackbar('发送成功(*^▽^*)')
    } catch (err) {
      SfcUtils.alert((err && err.toString) ? err.toString() : '未知错误')
    }
  }
}, false, loadingManager)
const commentList = ref<Comment[]>([])

const keyupHandler = (e: KeyboardEvent) => {
  if (e.ctrlKey && e.key == 'Enter' && !loading.value) {
    actions.send()
  }
}
onMounted(() => {
  actions.loadData(0, true)
})
</script>

<script lang="ts">
import API from 'sfc-common/api'
import { Comment, IdType } from 'sfc-common/model'
import { LoadingManager } from 'sfc-common/utils/LoadingManager'
import { MethodInterceptor } from 'sfc-common/utils/MethodInterceptor'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted } from 'vue'

export default defineComponent({
  name: 'CommentBoard'
})
</script>

<style scoped>

.message-area {
  max-height: v-bind(maxMessageHeight);
  margin-bottom: 6px;
  overflow: auto;
}
</style>