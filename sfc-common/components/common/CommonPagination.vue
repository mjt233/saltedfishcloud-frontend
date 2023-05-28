<template>
  <div class="common-pagination">
    <span class="tip">总数: {{ totalCount }}条</span>
    <FormSelect
      style="margin: 0 0 12px 12px;max-width: 120px"
      :hide-details="true"
      :items="pageSizeOptions"
      :model-value="pageSize"
      @update:model-value="emits('update:pageSize', $event)"
    />
    <v-pagination
      :model-value="modelValue"
      color="primary"
      :length="totalPage"
      :total-visible="7"
      size="small"
      @update:model-value="emits('update:modelValue', $event)"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  totalCount: {
    type: [Number, String],
    default: 0
  },
  totalPage: {
    type: [Number, String],
    default: 0
  },
  modelValue: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 10
  }
})
const emits = defineEmits(['update:modelValue', 'update:pageSize'])
const pageSizeOptions: SelectOption[] = [
  { title: '10条/页', value: 10 },
  { title: '20条/页', value: 20 },
  { title: '50条/页', value: 50 },
  { title: '100条/页', value: 100 },
]


</script>

<script lang="ts">
import { SelectOption } from 'sfc-common/model'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'
import FormSelect from './FormSelect.vue'

export default defineComponent({
  name: 'CommonPagination',
  components: { FormSelect }
})
</script>


<style scoped lang="scss">
.common-pagination {
  display: flex;
  align-items: center;
  justify-content: right;
}
</style>