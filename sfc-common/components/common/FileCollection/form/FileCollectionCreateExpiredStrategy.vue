<template>
  <FormRow v-if="!readonly">
    <FormCol class="mw-50">
      <v-select
        v-model="expiredStrategy"
        label="有效天数"
        color="primary"
        :items="expiredOptions"
        :item-title="'title'"
        return-object
        variant="underlined"
        density="comfortable"
        class="hide-details no-padding"
      />
    </FormCol>
  </FormRow>
  <FormRow v-if="expiredStrategy?.value == '0'">
    <FormCol class="mw-50">
      <text-input
        v-model="customExpired"
        label="自定义过期"
        suffix="天"
        placeholder="过期时间"
        variant="underlined"
        class="dense-details"
        color="primary"
        :rules="validators"
      />
    </FormCol>
  </FormRow>
  <FormRow v-if="readonly" class="form-row">
    <FormCol label="过期时间" top-label>
      <div style="color: #555555;">
        {{ toDate(expiredAt) }}
      </div>
    </FormCol>
  </FormRow>
</template>

<script setup lang="ts">
import { FormCol } from 'sfc-common/components/layout'
import TextInput from '../../TextInput.vue'
interface ExpiredStrategyOption {
  title: string
  strategy: () => any,
  value: string
}
const validators = [Validators.notNull('自定义过期时间不能为空'), Validators.maxLen('最大不能超过6位数', 6)]
const toDate = StringFormatter.toDate
const props = defineProps({
  modelValue: {
    type: Number,
    default: new Date().getTime()
  },
  readonly: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['update:modelValue'])
const expiredStrategy = ref() as Ref<ExpiredStrategyOption>
const customExpired = ref('1')
const expiredAt = ref(props.modelValue)

watch(expiredStrategy, () => {
  expiredStrategy.value.strategy()
})
watch(() => props.modelValue, () => {
  expiredAt.value = props.modelValue
})
watch(customExpired, () => {
  updateDate(parseInt(customExpired.value))
})

const updateDate = (day: number) => {
  expiredAt.value = new Date().getTime() + 1000*24*60*60*day
  emit('update:modelValue', expiredAt.value)
}
const expiredOptions: ExpiredStrategyOption[] = [
  {
    title: '1天',
    value: '1',
    strategy: () => { updateDate(1) }
  },
  {
    title: '7天',
    value: '7',
    strategy: () => { updateDate(7) }
  },
  {
    title: '30天',
    value: '30',
    strategy: () => { updateDate(30) }
  },
  {
    title: '永久',
    value: '-1',
    strategy: () => { updateDate(365*100) }
  },
  {
    title: '自定义',
    value: '0',
    strategy: () => {}
  }
]

/**
 * 选择一项过期策略
 */
const select = (value: string) => {
  const optionObj = expiredOptions.find(e => e.value == value)
  if (optionObj) {
    expiredStrategy.value = optionObj
    optionObj.strategy()
  }
}

// 默认一天
select('1')

defineExpose({select})
</script>

<script lang="ts">
import { Validators } from 'sfc-common/core/helper/Validators'
import { StringFormatter } from 'sfc-common/utils/StringFormatter'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, watch } from 'vue'
import FormRow from 'sfc-common/components/layout/FormRow.vue'

export default defineComponent({
  name: 'FileCollectionCreateExpiredStrategy'
})
</script>
