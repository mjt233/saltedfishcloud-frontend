<template>
  <VCard
    class="mt-12"
    width="calc(100% - 32px)"
    max-width="480px"
  >
    <VCardText>
      <VAlert type="success" variant="tonal" class="mt-2">
        授权已完成，您可以返回第三方应用或设备继续使用。
      </VAlert>
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
</script>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DeviceSuccessView'
})
</script>
