<template>
  <v-row>
    <v-col>
      <v-btn color="primary">
        <v-icon icon="mdi-plus" />新建字段
      </v-btn>
    </v-col>
  </v-row>
  <v-row>
    <v-col>
      <h1>我是列表</h1>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">

</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'

export default defineComponent({
  name: 'FileCollectionFieldOption'
})
</script>