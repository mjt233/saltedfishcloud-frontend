<template>
  <v-text-field v-model="phone" @input="input" />
</template>

<script setup lang="ts">
const phone = ref('')
const props = defineProps({
  value: {
    type: [String, Number],
    default: ''
  }
})
phone.value = props.value.toString()
const emits = defineEmits(['update:value'])

const beforeVal = ref('')
const afterVal = ref('')

/**
 * 将字符串格式化为带空格的手机号码字符串形式
 * @param e 输入的字符
 * @returns 格式化手机号
 */
const toPhoneNumber = (e: string | number) => {
  const originNum = e.toString()
  const numGroup = []
  let step = 3
  for (let index = 0; index < originNum.length; index += step) {
    if (index > 2) {
      step = 4
    }
    numGroup.push(originNum.substring(index, index + step))
  }
  return numGroup.join(' ')
}

const input = async(e: any) => {
  // 获取当前光标位置（输入后）
  let start = e.target.selectionStart as number

  // 格式化号码字符串
  const val = (e.target.value as string).replaceAll(/[^0-9]/ig, '')

  // 设置号码input绑定的v-model属性
  phone.value = toPhoneNumber(val)

  // 等待其他异步和watch方法
  await nextTick()

  // 判断变化前后字符串长度的差，小于0说明是新增
  const diff = beforeVal.value.length - afterVal.value.length

  // 如果当前光标在右边界，发生新增，则将光标右移一位
  if (atEdge(start) == 2 && diff < 0) {
    start += 1
  }
  
  // 设置新的光标位置
  e.target.selectionStart = start
  e.target.selectionEnd = start 
  emits('update:value', val)
}

/**
 * 判断当前光标所处的边界位置
 * @returns 0 - 不在边界，1 - 左边界，2 - 右边界
 */
const atEdge = (cursor: number) => {
  const rem = (cursor + 2)%5
  if (rem == 0) {
    return 1
  } else if (rem == 1) {
    return 2
  } else {
    return 0
  }
}

watch(phone, async(newVal, oldVal) => {
  beforeVal.value = oldVal
  afterVal.value = newVal
})
</script>

<script lang="ts">
import { defineComponent, ref, defineProps, defineEmits, nextTick, watch, Ref } from 'vue'
import { context } from '@/core/context'

export default defineComponent({
  name: 'PhoneInput'
})
</script>