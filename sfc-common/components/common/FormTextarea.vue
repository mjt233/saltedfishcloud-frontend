<template>
  <div>
    <div class="tip">
      {{ node?.title }}
    </div>
    <SimpleTextarea v-bind="$attrs" style="margin-top: 0;" class="form-textarea" />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  node: {
    type: Object as PropType<ConfigNodeModel>,
    default: undefined
  }
})
</script>

<script lang="ts">
import { ConfigNodeModel } from 'sfc-common/model'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'

export default defineComponent({
  name: 'FormTextarea'
})
</script>

<style scoped>
.form-textarea {
  margin-top: 24px;
}
</style>