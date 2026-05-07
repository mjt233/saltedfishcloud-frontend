<template>
  <div>
    <LoadingMask :loading="isLoading" />
    <VList v-if="authList.length" style="background-color: transparent;" border="1">
      <VListItem
        v-for="item in authList"
        :key="item.id"
        v-ripple
        style="cursor: pointer;"
        :title="item.thirdPartyApp?.name"
        append-icon="mdi-chevron-right"
        @click="emits('itemClick', item)"
      >
        <template #prepend>
          <span style="width: 36px;height: 36px;border-radius: 50%; overflow: hidden;" class="mr-3">
            <CommonIcon
              :icon="item.thirdPartyApp?.icon || 'mdi-application'"
              size="36"
              class="d-inline-block"
              style="width: 100%;height: 100%;"
            />
          </span>
        </template>
      </VListItem>
    </VList>
    <EmptyTip v-else />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  uid: {
    type: [Number, String],
    required: true
  }
})
const emits = defineEmits<{
  (e: 'itemClick', auth: ThirdPartyAppAuthorization): void
}>()
const lm = new LoadingManager()
const isLoading = lm.getLoadingRef()
const authList = ref<ThirdPartyAppAuthorization[]>([])
const actions = MethodInterceptor.createAsyncActionProxy({
  async loadData() {
    const res = await SfcUtils.request(oauth.listUserAuthentication(props.uid))
    authList.value = res.data.data
  }
}, true, lm)

onMounted(() => {
  actions.loadData()
})
defineExpose({
  loadData: actions.loadData
})
</script>

<script lang="ts">
import oauth from 'sfc-common/api/oauth'
import { ThirdPartyAppAuthorization } from 'sfc-common/model/Oauth'
import { LoadingManager, MethodInterceptor } from 'sfc-common/utils'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted } from 'vue'
import CommonIcon from '../CommonIcon.vue'
import EmptyTip from '../EmptyTip.vue'
import LoadingMask from '../LoadingMask.vue'

export default defineComponent({
  name: 'ThirdPartyAppAuthList'
})
</script>