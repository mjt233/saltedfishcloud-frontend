<!-- 文件收集任务创建-总入口表单 -->
<template>
  <base-form
    ref="formRef"
    :model-value="formData"
    :submit-action="actions.submit"
    :son-forms="sonForms"
    label-width="120px"
  >
    <loading-mask :loading="loadingRef" />
    <v-row v-if="readonly">
      <v-col>
        <span class="form-label">
          文件提交链接：
        </span>
        <a class="link" target="_blank" :href="'/#/collect/' + initValue?.id + '/' + initValue?.verification">
          {{ submitLink }}
        </a> 
        
      </v-col>
    </v-row>
    <v-row class="form-row">
      <v-col>
        <text-input 
          v-model="formData.title"
          :readonly="readonly"
          label="标题"
          :rules="validators.title"
        />
      </v-col>
      <v-col>
        <text-input
          v-model="formData.nickname"
          variant="underlined"
          label="接收者署名"
          :rules="validators.nickname"
          :readonly="readonly"
          color="primary"
        />
      </v-col>
    </v-row>
    <v-row class="form-row">
      <v-col>
        <v-textarea
          v-model="formData.describe"
          :readonly="readonly"
          class="plain-textarea hide-details"
          label="描述"
          rows="1"
          color="primary"
          auto-grow
        />
      </v-col>
    </v-row>
    <v-row :align="'center'" :justify="'start'" class="form-row">
      <v-col>
        <span class="form-label">保存位置：</span>
        <div class="d-flex align-center">
          <template v-if="!readonly">
            <a class="link" style="padding: 0 8px" @click="selectPath">
              {{ fullPath }}
            </a>
            <v-btn flat @click="selectPath">
              浏览
            </v-btn>
          </template>
          <router-link
            v-else
            class="link"
            style="padding: 0 8px"
            target="_blank"
            :to="StringUtils.appendPath('/private', fullPath)"
          >
            {{ fullPath }}
          </router-link>
        </div>
      </v-col>
    </v-row>
    <!-- 过期策略选择 -->
    <file-collection-create-expired-strategy
      v-model="formData.expiredAt"
      :readonly="readonly"
    />
    <v-row class="form-row">
      <v-col>
        <span class="form-label">单独文件夹：</span>
        <v-switch
          v-model="aloneDir"
          :readonly="readonly"
          hide-details
          color="primary"
        />
      </v-col>
      <v-col>
        <span class="form-label">要求登录：</span>
        <v-switch
          v-model="requireLogin"
          :readonly="readonly"
          hide-details
          color="primary"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-divider style="margin-top: 16px" />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <file-collection-advanced-option 
          ref="sonFormRef"
          :readonly="readonly"
          label-width="120px"
          :init-value="initValue"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-divider />
      </v-col>
    </v-row>
  </base-form>
</template>

<script setup lang="ts">
import LoadingMask from 'sfc-common/components/common/LoadingMask.vue'
import BaseForm from 'sfc-common/components/common/BaseForm.vue'
import FileCollectionCreateExpiredStrategy from './FileCollectionCreateExpiredStrategy.vue'
import TextInput from '../../TextInput.vue'
import FileCollectionAdvancedOption from './FileCollectionAdvancedOption.vue'
const formRef = ref()
const sonFormRef = ref()
const sonForms = [sonFormRef]
const props = defineProps({
  uid: {
    type: Number,
    default: 0
  },
  initValue: {
    type: Object as PropType<CollectionInfo>,
    default: undefined
  },
  readonly: {
    type: Boolean,
    default: false
  }
})
const submitLink = computed(() => {
  if (props.initValue) {
    return StringUtils.appendPath(window.origin, '#','collect', props.initValue.id + '', props.initValue.verification)
  } else {
    return ''
  }
})
const savePath = ref('/')
const aloneDir = ref(true)
const requireLogin = ref(false)
watch(requireLogin, () => {
  formData.allowAnonymous = !requireLogin.value
})
// ===== 表单属性 =====
const formInst = defineForm({
  formRef,
  formData: {
    title: '',
    nickname: '',
    expiredAt: 0,
    saveNode: props.uid + '',
    describe: '',
    allowAnonymous: true
  },
  validators: {
    title: [Validators.notNull('标题不能为空')],
    nickname: [Validators.notNull('署名不能为空')]
  },
  actions: {
    async submit() {
      const allFormData = getFormData()
      // 单独文件夹的情况下，先创建文件夹后再取路径节点ID
      if (aloneDir.value) {
        await SfcUtils.request(API.file.mkdir(props.uid, savePath.value, formData.title))
        const nodes = (await SfcUtils.request(API.resource.getNodeInfo(props.uid, StringUtils.appendPath(savePath.value, formData.title)))).data.data
        allFormData.saveNode = nodes[nodes.length - 1].id
      }
      
      const conf = API.collection.create(allFormData)
      return await SfcUtils.request(conf)
    }
  }
})
const { loadingRef, formData, validators, loadingManager, actions, getFormData } = formInst

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

const fullPath = computed(() => {
  return aloneDir.value ?
    StringUtils.appendPath(savePath.value, formData.title) :
    savePath.value
})

defineExpose(formInst)

formData.nickname = context.session.value.user.name
onMounted(() => {
  if (props.initValue) {
    const obj = props.initValue
    Object.assign(formData, obj)
    formData.expiredAt = new Date(obj.expiredAt).getTime()
    const pathArr = obj.savePathSnapshot.split('/')
    aloneDir.value = pathArr.pop() == obj.title
    if (aloneDir.value) {
      savePath.value = StringUtils.appendPath('/', pathArr.join('/'))
    }
    requireLogin.value = !props.initValue.allowAnonymous
  }
})
</script>

<script lang="ts">
import { context } from 'sfc-common/core/context'
import { defineForm } from 'sfc-common/utils/FormUtils'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, watch, onMounted, computed } from 'vue'
import API from 'sfc-common/api'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { Validators } from 'sfc-common/core/helper/Validators'
import { StringUtils } from 'sfc-common/utils/StringUtils'
import { CollectionInfo } from 'sfc-common/model/FileCollection'

export default defineComponent({
  name: 'FileCollectionCreateForm'
})
</script>