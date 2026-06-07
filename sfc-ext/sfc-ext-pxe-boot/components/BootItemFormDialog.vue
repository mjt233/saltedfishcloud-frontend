<template>
  <VDialog
    :model-value="modelValue"
    max-width="960px"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <VCard>
      <VCardTitle>{{ editingItem ? '编辑启动项' : '添加启动项' }}</VCardTitle>
      <VCardText>
        <VForm ref="formRef">
          <VCard title="基础配置" class="mb-4">
            <VCardText>
              <VTextField
                v-model="form.displayName"
                label="启动项名称"
                :rules="[v => !!v || '请输入名称']"
                required
              />
              <VTextField
                v-model="form.description"
                label="iPXE 启动项菜单标题"
                rows="2"
              />
              <VTextField
                v-model="form.itemKey"
                label="唯一标识(用于 iPXE 脚本的标签，如 ubuntu-install)"
                :rules="[v => !!v || '请输入标识']"
                persistent-hint
              />
              <PathSelector
                v-model="form.resourcePath"
                :select-file="form.type == 'ISO'"
                editable
                uid="0"
                :label="form.type == 'ISO' ? '选择 ISO 文件路径' : '选择资源所在目录'"
                :rules="[v => !!v || '请输入或选择路径']"
                persistent-hint
              />
              <VSelect
                v-model="form.type"
                label="加载类型"
                :items="typeOptions"
                item-title="label"
                item-value="value"
              />
              <VTextField
                v-model.number="form.sortOrder"
                label="排序"
                type="number"
              />
              <VSwitch
                v-model="form.enabled"
                label="启用"
              />
            </VCardText>
          </VCard>

          <!-- KERNEL_INITRD 特有字段 -->
          <VCard v-if="form.type === 'KERNEL_INITRD'" title="kernel 与 initrd">
            <VCardText>
              
              <VTextField
                v-model="form.kernelFilename"
                label="内核文件名(e.g. vmlinuz)"
              />
              <VTextField
                v-model="form.initrdFilename"
                label="initrd 文件名(e.g. initrd.img)"
              />
            </VCardText>
          </VCard>

          <!-- ISO 特有字段 -->
          <VCard v-if="form.type === 'ISO'" title="ISO 启动配置">
            <VCardText>
              <VSelect
                v-if="form.type === 'ISO'"
                v-model="form.isoBootMethod"
                label="ISO 启动方式"
                :items="isoBootMethodOptions"
                item-title="label"
                item-value="value"
              />
              <VTextField
                v-if="form.isoBootMethod != 'SANBOOT'"
                v-model="form.kernelParams"
                label="内核参数"
                hint="跟随在 iPXE 脚本的 kernel 后面"
                persistent-hint
              />
            </VCardText>
          </VCard>

          <!-- 自定义字段 -->
          <VCard v-if="form.type === 'CUSTOM_IPXE_SCRIPT'" title="自定义 iPXE 脚本">
            <VCardText>
              <VAlert variant="text">
                脚本将嵌入在 iPXE 脚本的标签中
                
                <pre style="line-height: 14px;"><code class="ipxe-script">
#!ipxe
set base_url &lt;服务器地址&gt;
:{{ form.itemKey }}
set res_url &lt;启动项资源的http访问路径，支持iso内路径提取&gt;
&lt;你的自定义脚本&gt;
</code></pre>
              </VAlert>
              <CodeEditor v-model="form.customIpxeScript" hide-line-number language="text" />
            </VCardText>
          </VCard>
        </VForm>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn @click="emit('update:modelValue', false)">
          取消
        </VBtn>
        <VBtn color="primary" :loading="saving" @click="saveItem">
          保存
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
const SfcUtils = window.SfcUtils
import { BootItem, BootItemForm, createDefaultBootItemForm } from '../model'
import { PxeBootApi } from '../api'
const PathSelector = window.Components.PathSelector

/** BootItemFormDialog 组件的 Props 定义 */
interface Props {
  /** 对话框是否可见，支持 v-model 绑定 */
  modelValue: boolean
  /** 当前编辑的启动项，为 null 时表示新增模式 */
  editingItem?: BootItem | null
}

const props = withDefaults(defineProps<Props>(), {
  editingItem: null
})

/** 定义组件可触发的事件 */
const emit = defineEmits<{
  /** 对话框可见性变更时触发（用于 v-model 双向绑定） */
  (e: 'update:modelValue', val: boolean): void
  /** 启动项保存成功后触发，父组件可在此刷新列表 */
  (e: 'saved'): void
}>()

/** 保存按钮的加载状态 */
const saving = ref(false)
/** 表单组件的引用 */
const formRef = ref<any>(null)
/** 当前表单的数据 */
const form = ref<BootItemForm>(createDefaultBootItemForm())

/** 启动类型选项列表 */
const typeOptions = [
  { label: '内核 + initrd', value: 'KERNEL_INITRD' },
  { label: 'ISO 镜像', value: 'ISO' },
  { label: '自定义 iPXE 脚本', value: 'CUSTOM_IPXE_SCRIPT' }
]

/** ISO 启动方式选项列表 */
const isoBootMethodOptions = [
  { label: '提取内核启动 (Linux)', value: 'KERNEL' },
  { label: 'WIMBOOT (Windows PE)', value: 'WIMBOOT' },
  { label: 'MEMDISK 整盘加载', value: 'MEMDISK' },
  { label: 'SANBOOT', value: 'SANBOOT' }
]

// 当 editingItem 变化时，将数据填充到表单
watch(
  () => props.editingItem,
  (item) => {
    if (item) {
      // 编辑模式：将现有数据映射到表单
      form.value = {
        customIpxeScript: item.customIpxeScript || '',
        displayName: item.displayName,
        itemKey: item.itemKey,
        type: item.type,
        resourcePath: item.resourcePath,
        kernelFilename: item.kernelFilename || 'vmlinuz',
        initrdFilename: item.initrdFilename || 'initrd.img',
        kernelParams: item.kernelParams || '',
        enabled: item.enabled,
        sortOrder: item.sortOrder,
        description: item.description || '',
        isoBootMethod: item.isoBootMethod || 'KERNEL'
      }
    } else {
      // 新增模式：重置为默认值
      form.value = createDefaultBootItemForm()
    }
  }
)

/**
 * 提交表单，根据 editingItem 是否存在决定执行新增或更新操作
 */
const saveItem = async() => {
  saving.value = true
  try {
    if (props.editingItem) {
      // 更新已有启动项
      console.log(form.value)
      await SfcUtils.request(PxeBootApi.updateItem(props.editingItem.id, form.value))
      SfcUtils.snackbar('更新成功')
    } else {
      // 新增启动项
      await SfcUtils.request(PxeBootApi.createItem(form.value))
      SfcUtils.snackbar('创建成功')
    }
    emit('update:modelValue', false)
    emit('saved')
  } catch (e: any) {
    SfcUtils.snackbar('保存失败: ' + (e.message || e))
  } finally {
    saving.value = false
  }
}
</script>


<style>
.ipxe-script {
  font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
  font-size: 12px !important;
  line-height: 12px;
}
</style>