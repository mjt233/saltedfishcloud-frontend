<template>
  <VDialog
    :model-value="modelValue"
    max-width="600px"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <VCard>
      <VCardTitle>{{ editingItem ? '编辑启动项' : '添加启动项' }}</VCardTitle>
      <VCardText>
        <VForm ref="formRef">
          <VTextField
            v-model="form.displayName"
            label="启动项名称"
            :rules="[v => !!v || '请输入名称']"
            required
          />
          <VTextField
            v-model="form.description"
            label="启动项描述"
            rows="2"
          />
          <VTextField
            v-model="form.itemKey"
            label="唯一标识"
            :rules="[v => !!v || '请输入标识']"
            hint="用于 iPXE 脚本的标签，如 ubuntu-install"
            persistent-hint
          />
          <VSelect
            v-model="form.type"
            label="启动类型"
            :items="typeOptions"
            item-title="label"
            item-value="value"
          />
          <PathSelector
            v-model="form.resourcePath"
            select-file
            editable
            uid="0"
            label="资源路径"
            :rules="[v => !!v || '请输入路径']"
            hint="网盘中的文件或目录路径"
            persistent-hint
          />

          <!-- KERNEL_INITRD 特有字段 -->
          <template v-if="form.type === 'KERNEL_INITRD'">
            <VTextField
              v-model="form.kernelFilename"
              label="内核文件名"
              hint="如 vmlinuz、bzImage"
              persistent-hint
            />
            <VTextField
              v-model="form.initrdFilename"
              label="initrd 文件名"
              hint="如 initrd.img、initramfs.img"
              persistent-hint
            />
          </template>

          <!-- ISO 特有字段 -->
          <VSelect
            v-if="form.type === 'ISO'"
            v-model="form.isoBootMethod"
            label="ISO 启动方式"
            :items="isoBootMethodOptions"
            item-title="label"
            item-value="value"
          />

          <VTextField
            v-model="form.kernelParams"
            label="内核参数"
            hint="额外的内核启动参数"
            persistent-hint
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

<script lang="ts">
import { defineComponent, PropType, ref, watch } from 'vue'
const SfcUtils = window.SfcUtils
import { BootItem, BootItemForm, createDefaultBootItemForm } from '../model'
import { PxeBootApi } from '../api'
const PathSelector = window.Components.PathSelector
export default defineComponent({
  name: 'BootItemFormDialog',
  components: {
    PathSelector
  },
  props: {
    /**
     * 对话框是否可见，支持 v-model 绑定
     */
    modelValue: {
      type: Boolean,
      required: true
    },
    /**
     * 当前编辑的启动项，为 null 时表示新增模式
     */
    editingItem: {
      type: Object as PropType<BootItem | null>,
      default: null
    }
  },
  emits: {
    /**
     * 对话框可见性变更时触发（用于 v-model 双向绑定）
     * @param val 新的可见状态
     */
    'update:modelValue': (val: boolean) => typeof val === 'boolean',
    /**
     * 启动项保存成功后触发，父组件可在此刷新列表
     */
    saved: () => true
  },
  setup(props, { emit }) {
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
      { label: '目录', value: 'DIRECTORY' }
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

    return {
      saving,
      formRef,
      form,
      typeOptions,
      isoBootMethodOptions,
      saveItem,
      emit
    }
  }
})
</script>
