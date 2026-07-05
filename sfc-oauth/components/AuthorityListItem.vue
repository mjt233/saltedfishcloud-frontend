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

    <template #append>
      <div class="d-flex align-center">
        <!-- 敏感权限警告图标 -->
        <VTooltip v-if="item.isDanger" location="bottom">
          敏感权限，请注意数据安全
          <template #activator="{ props: p }">
            <CommonIcon
              icon="mdi-alert"
              color="warning"
              size="26"
              v-bind="p"
              :class="{'mr-2': showCheckbox}"
            />
          </template>
        </VTooltip>
        <!-- 权限选择复选框（仅在启用时显示） -->
        <VCheckbox
          v-if="showCheckbox"
          :model-value="checked"
          :disabled="disabled"
          color="primary"
          hide-details
          density="compact"
          @update:model-value="emit('update:checked', !!$event)"
        />
      </div>
    </template>
  </VListItem>
</template>

<script setup lang="ts">
const props = defineProps({
  /** 权限项信息 */
  item: {
    type: Object as PropType<AuthorityItem>,
    required: true
  },
  /** 是否显示复选框，默认不显示 */
  showCheckbox: {
    type: Boolean,
    default: false
  },
  /** 复选框是否勾选 */
  checked: {
    type: Boolean,
    default: false
  },
  /** 复选框是否禁用（已授权的权限） */
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits<{
  /** 勾选状态变更事件 */
  (e: 'update:checked', value: boolean): void
}>()
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