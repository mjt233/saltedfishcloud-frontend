<template>
  <v-row v-if="!readonly" :align="'center'" class="form-row">
    <v-col class="mw-50">
      <span class="form-label">有效天数：</span>
      <v-select
        v-model="expiredStrategy"
        color="primary"
        :items="expiredOptions"
        :item-title="'title'"
        return-object
        variant="underlined"
        density="comfortable"
        class="hide-details no-padding"
      />
    </v-col>
  </v-row>
  <v-row v-if="expiredStrategy?.value == '0'" align="center" class="form-row">
    <v-col class="mw-50">
      <span class="form-label">自定义过期：</span>
      <text-input
        v-model="customExpired"
        suffix="天"
        placeholder="过期时间"
        variant="underlined"
        class="dense-details"
        color="primary"
        :rules="validators"
      />
    </v-col>
  </v-row>
  <v-row v-if="readonly" class="form-row">
    <v-col>
      <span>过期时间：</span>
      <div style="color: #555555;">
        {{ toDate(expiredAt) }}
      </div>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
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
import { Validators } from '@/core/helper/Validators'
import { StringFormatter } from '@/utils/StringFormatter'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, watch } from 'vue'

export default defineComponent({
  name: 'FileCollectionCreateExpiredStrategy'
})
</script>
