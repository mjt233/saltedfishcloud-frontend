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
                :md5="item.nid"
                style="margin-right: 12px; width: 32px;"
              />
              <span>{{ item.name }}</span>
            </div>
            <div class="d-flex align-center date-col" :class="{'expired-date': item.isExpired}">
              有效期：<span class="date-text">{{ item.expiredAt ? StringFormatter.toDate(item.expiredAt) : '永久' }}</span>
            </div>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <form-grid>
            <v-row class="form-row" align="center">
              <v-col style="height: auto; align-items: flex-start;">
                <span class="form-label">分享链接：</span>
                <a class="link break-text" :href="ShareService.getShareLink(item)" target="_blank">{{ ShareService.getShareLink(item) }}</a>
              </v-col>
            </v-row>
            <v-row v-if="isSelf" class="form-row">
              <v-col v-if="item.extractCode">
                <span class="form-label">提取码：</span>
                <span>{{ item.extractCode }}</span>
              </v-col>
              <v-col v-else>
                未设置提取码
              </v-col>
            </v-row>
            <v-row v-if="isSelf" :align="'start'">
              <v-col class="share-handle-group">
                <v-btn color="error" @click="actions.deleteShare(item)">
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-delete" /> 取消分享
                  </div>
                </v-btn>
                <v-btn color="primary" @click="ShareService.copyShareLinkText(item)">
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-content-copy" />
                    复制信息
                  </div>
                </v-btn>
              </v-col>
            </v-row>
          </form-grid>
          
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
import { ShareService } from '@/core/serivce/ShareService'
import FormGrid from '@/components/layout/FormGrid.vue'
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
  },
  doCopy(item: ShareInfo) {
    ShareService.copyShareLinkText(item)
  },
  deleteShare(item: ShareInfo) {
    SfcUtils.confirm('确定要取消该分享吗？', '取消确认', {cancelToReject: true})
      .then(() => { loadingManager.beginLoading();ShareService.deleteShare(item.id) })
      .then(async() => {
        await SfcUtils.sleep(200)
        const ret = await this.loadList(curPage.value, curSize.value)
        SfcUtils.snackbar('删除成功')
        return ret
      })
      .catch(err => err != 'cancel' && SfcUtils.snackbar(err))
      .finally(() => {
        loadingManager.closeLoading()
      })
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


.share-handle-group {
  &>* {
    margin-right: 12px;
  }
}
</style>