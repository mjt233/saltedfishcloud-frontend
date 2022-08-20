<template>
  <v-row class="form-row">
    <slot />
  </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FormRow'
})
</script>