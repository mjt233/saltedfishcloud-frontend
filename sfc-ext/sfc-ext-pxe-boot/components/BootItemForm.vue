<template>
  <BaseForm ref="formRef" :model-value="formData" :submit-action="actions.submit">
    <VCard title="基础配置" class="mb-4">
      <VCardText>
        <VTextField
          v-model="formData.displayName"
          label="启动项名称"
          :rules="validators.displayName"
          required
        />
        <VTextField
          v-model="formData.description"
          label="iPXE 启动项菜单标题"
          rows="2"
        />
        <VTextField
          v-model="formData.itemKey"
          label="唯一标识(用于 iPXE 脚本的标签，如 ubuntu-install)"
          :rules="validators.itemKey"
          persistent-hint
        />
        <VSelect
          v-model="formData.type"
          label="启动项资源类型"
          :items="typeOptions"
          item-title="label"
          item-value="value"
        />
        <PathSelector
          v-model="formData.resourcePath"
          :select-file="formData.type == 'ISO'"
          editable
          uid="0"
          :label="formData.type == 'ISO' ? '选择 ISO 文件路径' : '选择资源所在目录'"
          :rules="validators.resourcePath"
          persistent-hint
        />
        <VTextField
          v-model.number="formData.sortOrder"
          label="排序"
          type="number"
        />
        <VSwitch
          v-model="formData.enabled"
          label="启用"
        />
      </VCardText>
    </VCard>

    <!-- KERNEL_INITRD 特有字段 -->
    <VCard v-if="formData.type === 'KERNEL_INITRD'" title="kernel 与 initrd">
      <VCardText>
        
        <VTextField
          v-model="formData.kernelFilename"
          label="内核文件名(e.g. vmlinuz)"
        />
        <VTextField
          v-model="formData.initrdFilename"
          label="initrd 文件名(e.g. initrd.img)"
        />
      </VCardText>
    </VCard>

    <!-- ISO 特有字段 -->
    <VCard v-if="formData.type === 'ISO'" title="ISO 启动配置" class="mb-4">
      <VCardText>
        <VSelect
          v-if="formData.type === 'ISO'"
          v-model="formData.isoBootMethod"
          label="ISO 启动方式"
          :items="isoBootMethodOptions"
          item-title="label"
          item-value="value"
        />
        <VTextField
          v-if="formData.isoBootMethod != 'SANBOOT' && formData.isoBootMethod != 'CUSTOM_IPXE_SCRIPT'"
          v-model="formData.kernelParams"
          label="内核参数"
          hint="跟随在 iPXE 脚本的 kernel 后面"
          persistent-hint
        />
      </VCardText>
    </VCard>

    <!-- 自定义字段 -->
    <VCard v-if="formData.type === 'CUSTOM_IPXE_SCRIPT' || formData.isoBootMethod == 'CUSTOM_IPXE_SCRIPT'" title="自定义 iPXE 脚本">
      <VCardText>
        <VAlert variant="text">
          脚本将嵌入在 iPXE 脚本的标签中
          
          <pre style="line-height: 14px;"><code class="ipxe-script">#!ipxe
set base_url &lt;服务器地址&gt;
:{{ formData.itemKey }}
set res_url &lt;启动项资源的http访问路径，支持iso内路径提取&gt;
&lt;你的自定义脚本&gt;
</code></pre>
        </VAlert>
        <CodeEditor v-model="formData.customIpxeScript" language="text" />
      </VCardText>
    </VCard>
  </BaseForm>
</template>

<script setup lang="ts">
import { computed, ref, watch, type Ref } from 'vue'
import { CommonForm, defineForm, Validators } from 'sfc-common'
const SfcUtils = window.SfcUtils
import { BootItem, BootItemForm as BootItemFormType, createDefaultBootItemForm } from '../model'
import { PxeBootApi } from '../api'
const PathSelector = window.Components.PathSelector

/** BootItemForm 组件的 Props 定义 */
interface Props {
  /** 当前编辑的启动项，为 null 时表示新增模式 */
  editingItem?: BootItem | null
}

const props = withDefaults(defineProps<Props>(), {
  editingItem: null
})

/** 表单组件的引用 */
const formRef = ref() as Ref<CommonForm>

/** 启动类型选项列表 */
const typeOptions = [
  { label: 'ISO 镜像', value: 'ISO' },
  { label: '内核 + initrd', value: 'KERNEL_INITRD' },
  { label: '自定义 iPXE 脚本', value: 'CUSTOM_IPXE_SCRIPT' }
]

/** ISO 启动方式选项列表 */
const isoBootMethodOptions = [
  { label: '提取内核启动 (Linux)', value: 'KERNEL' },
  { label: 'WIMBOOT (Windows PE)', value: 'WIMBOOT' },
  { label: 'MEMDISK 整盘加载', value: 'MEMDISK' },
  { label: 'SANBOOT', value: 'SANBOOT' },
  { label: '自定义 iPXE 脚本', value: 'CUSTOM_IPXE_SCRIPT' }
]

/** 将启动项实体转换为表单初始值 */
const createFormData = (item?: BootItem | null): BootItemFormType => ({
  customIpxeScript: item?.customIpxeScript || '',
  displayName: item?.displayName || '',
  itemKey: item?.itemKey || '',
  type: item?.type || 'ISO',
  resourcePath: item?.resourcePath || '',
  kernelFilename: item?.kernelFilename || 'vmlinuz',
  initrdFilename: item?.initrdFilename || 'initrd.img',
  kernelParams: item?.kernelParams || '',
  enabled: item?.enabled ?? true,
  sortOrder: item?.sortOrder ?? 0,
  description: item?.description || '',
  isoBootMethod: item?.isoBootMethod || 'KERNEL'
})

/** 当前是否处于编辑模式 */
const isEditing = computed(() => !!props.editingItem)

const formInst = defineForm({
  actions: {
    async submit() {
      if (isEditing.value && props.editingItem) {
        await SfcUtils.request(PxeBootApi.updateItem(props.editingItem.id, formData))
        SfcUtils.snackbar('更新成功')
      } else {
        await SfcUtils.request(PxeBootApi.createItem(formData))
        SfcUtils.snackbar('创建成功')
      }
      return true
    }
  },
  formData: createDefaultBootItemForm(),
  formRef,
  validators: {
    displayName: [Validators.minLen('请输入名称', 1)],
    itemKey: [Validators.minLen('请输入标识', 1)],
    resourcePath: [Validators.minLen('请输入或选择路径', 1)]
  },
  throwError: true
})

const { formData, actions, validators } = formInst

watch(
  () => props.editingItem,
  (item) => {
    Object.assign(formData, createFormData(item))
  },
  { immediate: true }
)

/**
 * 提交表单，根据 editingItem 是否存在决定执行新增或更新操作
 * @returns {Promise<boolean>} 保存成功返回 true，失败返回 false
 */
const saveItem = async(): Promise<boolean> => {
  try {
    await actions.submit()
    return true
  } catch (e: any) {
    SfcUtils.snackbar('保存失败: ' + (e.message || e))
    return false
  }
}

/** 暴露 saveItem 方法供父组件通过对话框调用 */
(formInst as typeof formInst & { saveItem: typeof saveItem }).saveItem = saveItem
defineExpose(formInst)
</script>


<style>
.ipxe-script {
  font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
  font-size: 12px !important;
  line-height: 12px;
}
</style>
