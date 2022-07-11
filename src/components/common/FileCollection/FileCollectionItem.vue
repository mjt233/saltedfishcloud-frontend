<template>
  <v-card>
    <v-card-header>
      <v-card-header-text>
        <div class="d-flex justify-space-between align-center" style="width: 100%">
          <span class="title">{{ item?.title }}</span>
          <span class="state">状态：<span :class="isCollecting ? 'text-success' : 'text-error'">{{ isCollecting ? '收集中' : '已关闭' }}</span></span>
        </div>
      </v-card-header-text>
    </v-card-header>
    <v-divider class="card-divider" />
    <v-card-content class="content">
      <div>
        剩余可接受文件数：{{ item?.available == -1 ? '无限制' : item?.available }}
      </div>
      <div class="date text-blue-grey">
        创建日期：{{ formateDate(item?.createdAt || '') }}
      </div>
      <div class="date text-blue-grey">
        过期日期：{{ formateDate(item?.expiredAt || '') }}
      </div>
    </v-card-content>
  </v-card>
</template>

<script setup lang="ts">
const props = defineProps({
  item: {
    type: Object as PropType<CollectionInfo>,
    default: undefined
  }
})

const formateDate = StringFormatter.toDate

const isCollecting = computed(() => {
  return props.item?.state == 'OPEN'
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'
import { CollectionInfo } from '@/api/collection'
import { computed } from '@vue/reactivity'
import { StringFormatter } from '@/utils/StringFormatter'
export default defineComponent({
  name: 'FileCollectionItem'
})
</script>

<style scoped lang="scss">
.state {
  font-size: 12px;
}

.title {
  font-size: 14px;
}

.card-divider {
  width: 90%;
  margin: 0 5%;
}

.date {
  font-size: 12px;
}

.content {
  font-size: 14px;
  &>* {
    margin-bottom: 6px;
  }
}
</style>