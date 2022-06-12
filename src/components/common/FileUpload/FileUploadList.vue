<template>
  <v-list>
    <slot />
  </v-list>
</template>

<script setup lang="ts">
const session = context.session
</script>

<script lang="ts">
import { defineComponent } from 'vue'
import { context } from '@/core/context'

export default defineComponent({
  name: 'FileUploadList'
})
</script>