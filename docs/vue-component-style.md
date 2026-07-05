## 新增普通 Vue 组件

基于以下模板代码创建

```vue
<template>
  <div>
    <h1>Hello World</h1>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  propName: {
    type: String,
    default: 'defaultValue'
  }
})

const emit = defineEmits<{
  (e: 'eventName1', value: EventParamType): void,
  (e: 'eventName2', value: EventParamType2): void,
}>()
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'

export default defineComponent({
  name: 'NewComponentName'
})
</script>
```

## 新增表单类型的 Vue 组件

### 组件创建

基于以下模板创建

```vue
<template>
  <base-form ref="formRef" :model-value="formData" :submit-action="actions.submit">
    <h1>Hello World</h1>
  </base-form>
</template>

<script setup lang="ts">
/* VS Code代码片段生成 prefix: vform */
import { CommonForm, defineForm, Validators } from 'sfc-common'
const formRef = ref() as Ref<CommonForm>
const props = defineProps({})
const emits = defineEmits<{
  (e: 'submit'): void
}>()
const SfcUtils = window.SfcUtils
const formInst = defineForm({
  actions: {
    async submit() {
      await SfcUtils.request(xxxApi)
    }
  },
  formData: {
    field1: 'field1Value'
  },
  formRef: formRef,
  validators: {
    field1: [
      Validators.notNull('xxx不能为空')
    ]
  },
  throwError: true
})
const { formData, actions, validators, loadingRef, loadingManager  } = formInst


defineExpose(formInst)
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'

export default defineComponent({
  name: 'NewXxxxForm'
})
</script>
```

### 使用数据提交类型的表单组件

通过以下方式打开表单：

```ts
import XxxxFormVue from 'the/form/path/XxxxForm.vue'
const formInst = SfcUtils.openComponentDialog(XxxxFormVue, {
  title: '对话框标题',
  props: {
    // 传入表单的props
  },
  async onConfirm() {
    const form = formInst.getComponentInstRef() as any as CommonForm
    const res = await form.submit({ showError: false })
    if (!res.success) {
      // 表单提交失败动作
      return false
    } else {
      // 表单提交成功动作
      return true
    }
  }
})
```