<template>
  <base-form ref="formRef" :model-value="formData" :submit-action="actions.submit">
    <loading-mask :loading="loadingRef" />
    <v-row>
      <v-col><text-input v-model="formData.title" label="标题" :rules="validators.title" /></v-col>
      <v-col><text-input v-model="formData.nickname" label="接收者署名" :rules="validators.nickname" /></v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-textarea
          v-model="formData.describe"
          class="plain-textarea"
          label="描述"
          rows="1"
          color="primary"
          auto-grow
        />
      </v-col>
    </v-row>
    <v-row :align="'center'" :justify="'start'">
      <v-col class="common-label">
        <span>保存位置：</span>
      </v-col>
      <v-col>
        <div class="d-flex align-center">
          <a class="link" style="padding: 0 8px" @click="selectPath">{{ savePath }}{{ aloneDir ? (savePath.endsWith('/') ? '' : '/') + formData.title : '' }} </a>
          <v-btn flat @click="selectPath">
            浏览
          </v-btn>
        </div>
      </v-col>
    </v-row>
    <v-row :align="'center'" :justify="'center'">
      <v-col class="form-label">
        <span>单独文件夹：</span>
      </v-col>
      <v-col>
        <v-switch v-model="aloneDir" hide-details color="primary" />
      </v-col>
    </v-row>
    <!-- 过期策略选择 -->
    <file-collection-create-expired-strategy v-model="formData.expiredAt" />
  </base-form>
</template>

<script setup lang="ts">
import LoadingMask from '@/components/common/LoadingMask.vue'
import BaseForm from '@/components/common/BaseForm.vue'
import FileCollectionCreateExpiredStrategy from './FileCollectionCreateExpiredStrategy.vue'
import TextInput from '../../TextInput.vue'
const formRef = ref()
const props = defineProps({
  uid: {
    type: Number,
    default: 0
  }
})
const savePath = ref('/')
const aloneDir = ref(false)
// ===== 表单属性 =====
const formInst = defineForm({
  formRef,
  formData: {
    title: '',
    nickname: '',
    expiredAt: 0,
    saveNode: props.uid + '',
    describe: ''
  },
  validators: {
    title: [Validators.notNull('标题不能为空')],
    nickname: [Validators.notNull('署名不能为空')]
  },
  actions: {
    async submit() {
      // todo 待添加更多预设参数
      const conf = API.collection.create({
        title: formData.title,
        nickname: formData.nickname,
        expiredAt: formData.expiredAt,
        saveNode: formData.saveNode,
        describe: formData.describe
      })
      return await SfcUtils.request(conf)
    }
  }
})
const { loadingRef, formData, validators, loadingManager, actions } = formInst

/**
 * 选择保存路径
 */
const selectPath = async() => {
  try {
    loadingManager.beginLoading()
    const path = await SfcUtils.selectPath({
      uid: props.uid,
      path: savePath.value,
    })
    const info = (await SfcUtils.request(API.resource.getNodeInfo(props.uid, path))).data.data
    const nid = info.pop()?.id

    if (!nid) {
      return Promise.reject('无效的路径：' + path)
    }
    savePath.value = path
  } catch(err) {
    if (err != 'cancel') {
      SfcUtils.snackbar(err)
    }
  } finally {
    loadingManager.closeLoading()
  }
}

defineExpose(formInst)
</script>

<script lang="ts">
import { defineForm } from '@/utils/FormUtils'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, watch } from 'vue'
import API from '@/api'
import SfcUtils from '@/utils/SfcUtils'
import { Validators } from '@/core/helper/Validators'

export default defineComponent({
  name: 'FileCollectionCreateForm'
})
</script>