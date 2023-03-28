<template>
  <div>
    <VBtn @click="check">
      检查
    </VBtn>
  </div>
</template>

<script setup lang="ts">
const SfcUtils = window.SfcUtils
const check = async() => {
  const dialog = window.SfcUtils.loadingDialog({msg: '检查中...'})
  try {
    await SfcUtils.request(VEAPI.check())
    dialog.close()
    await SfcUtils.sleep(250)
    await SfcUtils.alert('配置正确')
  } catch (err) {
    dialog.close()
    await SfcUtils.sleep(250)
    SfcUtils.alert('' + err, '配置错误')
  }
  
}
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'
import { VEAPI } from '../api'

export default defineComponent({
  name: 'VideoEnhanceCheck'
})
</script>