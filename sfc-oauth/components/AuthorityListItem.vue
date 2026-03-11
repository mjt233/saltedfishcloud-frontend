<template>
  <VListItem
    class="authority-list-item"
    :subtitle="item.describe"
  >
    <template #prepend>
      <CommonIcon
        :icon="item.icon"
        :color="item.isDanger ? 'warning' : 'primary'"
        size="32"
        class="mr-3"
      />
    </template>
    <template #title>
      <span :class="{'text-warning': item.isDanger}">{{ item.name }}</span>
    </template>

    <template v-if="item.isDanger" #append>
      <VTooltip location="bottom">
        敏感权限，请注意数据安全
        <template #activator="{ props: p }">
          <CommonIcon
            icon="mdi-alert"
            color="warning"
            size="26"
            v-bind="p"
          />
        </template>
      </VTooltip>
        
    </template>
  </VListItem>
</template>

<script setup lang="ts">
const props = defineProps({
  item: {
    type: Object as PropType<AuthorityItem>,
    required: true
  }
})
</script>

<script lang="ts">
import CommonIcon from 'sfc-common/components/common/CommonIcon.vue'
import { AuthorityItem } from 'sfc-oauth/model'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'

export default defineComponent({
  name: 'AuthorityListItem'
})
</script>



<style>
.authority-list-item .v-list-item-subtitle {
  -webkit-line-clamp: unset !important;
  line-clamp: unset !important;
}
</style>