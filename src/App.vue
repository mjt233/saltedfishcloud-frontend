<template>
  <div id="app" ref="app">
      <file-upload-dialog></file-upload-dialog>
      <router-view />
  </div>
</template>

<script>
import FileUploadDialog from '@/components/FileUploadDialog/index.vue'
export default {
    name: 'App',
    components: {
        FileUploadDialog
    },
    mounted() {
        document.querySelector('#first-load').classList.add('hid')
        setTimeout(() => {
            document.querySelector('#first-load').remove()
        }, 1000)
    }
}
</script>
