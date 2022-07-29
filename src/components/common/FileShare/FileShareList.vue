<template>
  <div class="file-share-list">
    <loading-mask :loading="loading" />
    <div class="d-flex align-center" style="margin-bottom: 12px">
      <v-pagination
        v-model="curPage"
        :length="totalPage"
        color="primary"
        size="small"
        style="width: calc(100% - 112px)"
      />
      <span style="color: #555555;font-size: 12px;margin: 0 24px;">
        共{{ totalCount }}条分享
      </span>
    </div>
    
    <v-expansion-panels>
      <v-expansion-panel v-for="(item) in shareList" :key="item.id">
        <v-expansion-panel-title>
          <div class="title-row" style="width: 100%">
            <div class="d-flex align-center">
              <file-icon
                class="icon"
                :file-name="item.name"
                :is-dir="item.type == 'DIR'"
                style="margin-right: 12px"
              />
              <span style="color: #555555;">{{ item.name }}</span>
            </div>
            <div class="d-flex align-center date-col" :class="{'expired-date': item.isExpired}">
              有效期：<span class="date-text">{{ item.expiredAt ? StringFormatter.toDate(item.expiredAt) : '永久' }}</span>
            </div>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <template v-if="isSelf">
            <div v-if="item.extractCode">
              提取码：{{ item.extractCode }}
            </div>
            <div v-else>
              未设置提取码
            </div>
          </template>
          
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
    <empty-tip v-if="shareList.length == 0" />
  </div>
</template>

<script setup lang="ts">
import LoadingMask from '../LoadingMask.vue'
import FileIcon from '../FileIcon.vue'
import { StringFormatter } from '@/utils/StringFormatter'
import EmptyTip from '../EmptyTip.vue'
const props = defineProps({
  uid: {
    type: [Number, String],
    default: '0'
  }
})

const loadingManager = new LoadingManager()
const loading = loadingManager.getLoadingRef()
const shareList = ref([]) as Ref<(ShareInfo & { isExpired: boolean })[]>
const isSelf = computed(() => {
  return props.uid == context.session.value.user.id
})
const curPage = ref(1)
const curSize = ref(10)
const totalPage = ref(1)
const totalCount = ref(0)

const actions = MethodInterceptor.createAsyncActionProxy({
  async loadList(page: number, size: number) {
    const uid = isSelf.value ? null : props.uid
    const pageInfo = ((await SfcUtils.request(API.share.getShareList(uid, page, size))).data.data)
    const data = pageInfo.content as (ShareInfo & { isExpired: boolean })[]
    totalPage.value = pageInfo.totalPage
    totalCount.value = pageInfo.totalCount
    
    const now = new Date().getTime()
    data.forEach(e => {
      if (e.expiredAt && new Date(e.expiredAt).getTime() < now) {
        e.isExpired = true
      } else {
        e.isExpired = false
      }
    })

    shareList.value = data
  }
}, true, loadingManager)

watch(curPage, () => {
  actions.loadList(curPage.value, curSize.value)
})

onMounted(() => {
  actions.loadList(curPage.value, curSize.value)
})
</script>

<script lang="ts">
import API from '@/api'
import { ShareInfo } from '@/api/share'
import { LoadingManager } from '@/utils/LoadingManager'
import { MethodInterceptor } from '@/utils/MethodInterceptor'
import SfcUtils from '@/utils/SfcUtils'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted, computed, watch } from 'vue'
import { context } from '@/core/context'

export default defineComponent({
  name: 'FileShareList'
})
</script>


<style lang="scss" scoped>
.file-share-list {
  padding: 12px 0;
}

.icon {
  height: 32px;
  width: 32px;
}

.date-col {
  width: 160px;
  min-width: 160px;
  font-size: 12px;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
  @media screen and (max-width: 640px) {
    align-items: flex-start;
    flex-direction: column;
    .date-col {
      margin-top: 12px;
    }
  }
}

.expired-date .date-text {
  color: rgb(var(--v-theme-error));
}
</style>