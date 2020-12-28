<template>
  <file-browser
    :api="'getPrivateList'"
    :prefix="'private'"
    :rootName="'私人网盘'"
    :showPath="true"
    @clickFile='clickFile'
  >

  </file-browser>
</template>

<script>
import FileBrowser from "../components/FileBrowser.vue"

export default {
  components: { FileBrowser },
  name: 'PrivateDisk',
  methods: {
    clickFile(e) {
      let newPath = location.href.replace(`/#/private`, '/pridown') + `/${encodeURIComponent(e.name)}`
      location.href = newPath
    }
  }
}
</script>

<style>

</style>