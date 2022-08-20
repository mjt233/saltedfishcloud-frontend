<template>
  <div>
    <form-grid class="config-form-view" label-width="auto">
      <template v-for="item in node.nodes" :key="item.name">
        <div class="group-title">
          {{ item.title }}
        </div>
        <form-row>
          <form-col
            v-for="field in item.nodes"
            :key="field.name"
            style="max-width: 280px;"
            :label="field.title"
          >
            {{ valObj[field.name] }}
          </form-col>
        </form-row>
      </template>
    </form-grid>
    <v-btn color="primary">
      编辑
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import FormGrid from '@/components/layout/FormGrid.vue'
import FormRow from '../../layout/FormRow.vue'
import FormCol from '../../layout/FormCol.vue'
const props = defineProps({
  node: {
    type: Object as PropType<ConfigNodeModel>,
    default: () => {return{}}
  }
})
const valObj = computed(() => {
  return JSON.parse(props.node.value + '')
})

</script>

<script lang="ts">
import { ConfigNodeModel } from '@/core/model'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, computed, reactive } from 'vue'

export default defineComponent({
  name: 'ConfigNodeFormInput'
})
</script>

<style lang="scss" scoped>
.config-form-view {
  border: 1px solid rgba(var(--v-theme-primary), .3);
  padding: 6px;
  margin-bottom: 6px;
  margin: 12px 0;
}
.group-title {
  margin: 12px 0;
  font-weight: 600;
}
</style>