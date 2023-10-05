<template>
  <div class="static-publish-site-list-view">
    <div class="list-top-btns" style="margin: 12px 0;">
      <VBtn color="primary" style="margin-right: 12px;" @click="toAddOrEdit()">
        <CommonIcon icon="mdi-plus" /> 新增站点
      </VBtn>
      <VBtn @click="asyncActions.loadList()">
        <CommonIcon icon="mdi-refresh" /> 刷新
      </VBtn>
    </div>
    
    <LoadingMask :loading="loading" />
    <VCard>
      <VCardText>
        <EmptyTip v-if="list.length == 0" />
        <VTable v-else>
          <thead>
            <tr>
              <th>站点名称</th>
              <th>部署路径</th>
              <th>访问方式</th>
              <th>访问地址</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in list" :key="item.id">
              <td>{{ item.siteName }}</td>
              <td>{{ item.path }}</td>
              <td>{{ item.accessWay == 1 ? '按主机名' : '按用户路径' }}</td>
              <td><a class="link" :href="getSiteUrl(item)" target="_blank">{{ getSiteUrl(item) }}</a></td>
              <td class="handle-btns">
                <CommonIcon
                  class="link"
                  icon="mdi-eye"
                  title="预览"
                  @click="preview(item)"
                />
                <a :href="getSiteUrl(item)" target="_blank" title="转跳">
                  <CommonIcon
                    class="link"
                    icon="mdi-link"
                  />
                </a>
                <CommonIcon
                  class="link"
                  icon="mdi-pencil"
                  title="编辑"
                  @click="toAddOrEdit(item)"
                />
                <CommonIcon
                  class="link"
                  icon="mdi-close"
                  title="删除"
                  color="error"
                  @click="preview(item)"
                />
              </td>
            </tr>
          </tbody>
        </VTable>
      </VCardText>
    </VCard>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  uid: {
    type: [String, Number] as PropType<IdType>,
    default: 0
  }
})
const SfcUtils = window.SfcUtils
const lm = new LoadingManager
const loading = lm.getLoadingRef()
const actions = {
  async loadList() {
    const ret = await SfcUtils.request(StaticPublishApi.listSite(props.uid))
    list.value = ret.data.data
    return ret
  },
  async save(entity: StaticPublishRecord) {
    return await SfcUtils.request(StaticPublishApi.save(entity))
  },
  async delete(id: IdType) {
    return await SfcUtils.request(StaticPublishApi.deleteSite(id))
  }
}
const asyncActions = MethodInterceptor.createAsyncActionProxy(actions, true, lm)
const list = ref<StaticPublishRecord[]>([])

const property = StaticPublishApi.getProperty()

const getSiteUrl = (record: StaticPublishRecord) => {
  if (record.accessWay == 1) {
    return `${property.protocol}://${record.siteName}.${property.byHostSuffix}`
  } else {
    return `${property.protocol}://${record.username}.${property.byPathSuffix}/${record.siteName}`
  }
}

const preview = (record: StaticPublishRecord) => {
  SfcUtils.openComponentDialog(
    h('iframe', { src: getSiteUrl(record), style: {width: '80vw', height: '70vh', border: 'none'} }),
    {
      extraDialogOptions: {
        maxWidth: '90vw',
        showConfirm: false,
        cancelText: '关闭'
      },
      title: `站点预览: ${record.siteName}`
    }
  )
}

const openEditRecordForm = (record?: StaticPublishRecord) => {
  return new Promise<StaticPublishRecord>((resolve, reject) => {
    const inst = SfcUtils.openComponentDialog(StaticPublishRecordForm, {
      props: {
        initObject: record || { uid: props.uid } as StaticPublishRecord
      },
      title: record?.siteName ? `编辑站点: ${record.siteName}` : '新增站点',
      async onConfirm() {
        const form = inst.getInstAsForm()
        const validResult = await form.validate()
        if (!validResult.valid) {
          SfcUtils.snackbar(validResult.errors.map(e => e.errorMessages).join(';'))
          return false
        }
        const editData = form.getFormData() as StaticPublishRecord
        resolve(editData)
        console.info(editData)
        return true
      },
    })
  })
}

const toAddOrEdit = async(record?: StaticPublishRecord) => {
  const saveData = await openEditRecordForm(record)
  try {
    await asyncActions.save(saveData)
  } catch (err) {
    if (err != 'cancel') {
      await toAddOrEdit(saveData)
      return
    }
  }
  await asyncActions.loadList()
}

onMounted(() => {
  asyncActions.loadList()
})

</script>

<script lang="ts">
import { IdType, LoadingManager, MethodInterceptor } from 'sfc-common'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, h } from 'vue'
import StaticPublishApi from '../api'
import { StaticPublishRecord } from '../model'
import { onMounted } from 'vue'
import StaticPublishRecordForm from './StaticPublishRecordForm.vue'

export default defineComponent({
  name: 'StaticPublishSiteListView'
})
</script>

<style scoped lang="scss">
.static-publish-site-list-view {
  position: relative;
}

.handle-btns>* {
  margin-right: 6px;
}
</style>