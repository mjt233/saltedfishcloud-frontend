<template>
  <div class="common-view" style="width: 100%;max-width: 480px">
    <v-card>
      <v-card-header>
        <v-card-title>找回账号</v-card-title>
      </v-card-header>
      <v-card-content>
        <forget-form />
      </v-card-content>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import ForgetForm from '@/components/form/ForgetForm.vue'

</script>

<script lang="ts">
import { defineComponent } from 'vue'
import { context } from '@/core/context'

export default defineComponent({
  name: 'ForgetView'
})
</script>