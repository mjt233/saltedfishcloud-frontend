<template>
  <v-row :align="'center'">
    <v-col class="form-label">
      <span>有效天数：</span>
    </v-col>
    <v-col cols="5">
      <v-select
        v-model="expiredStrategy"
        color="primary"
        :items="expiredOptions"
        :item-title="'title'"
        return-object
        variant="underlined"
        density="comfortable"
        style="margin-top: 6px;"
      />
    </v-col>
  </v-row>
  <v-row v-if="expiredStrategy?.value == '0'" align="center">
    <v-col class="form-label" style="margin-bottom: 24px">
      自定义过期：
    </v-col>
    <v-col cols="5">
      <v-text-field
        v-model="customExpired"
        suffix="天"
        label="过期时间"
        variant="underlined"
        color="primary"
        :rules="validators"
      />
    </v-col>
  </v-row>
  <v-row>
    <v-col style="margin-bottom: 24px" cols="12">
      <div v-show="expiredStrategy?.value != '-1'" style="color: #555555;">
        将于 {{ toDate(expiredAt) }} 过期
      </div>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">

// ===== 过期策略相关 =====
interface ExpiredStrategyOption {
  title: string
  strategy: () => any,
  value: string
}
const validators = [Validators.maxLen('最大不能超过6位数', 6)]
const toDate = StringFormatter.toDate
const props = defineProps({
  modelValue: {
    type: Number,
    default: new Date().getTime()
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
