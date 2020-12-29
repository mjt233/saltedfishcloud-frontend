<template>
  <file-browser
    :api="'getPrivateList'"
    :prefix="'private'"
    :rootName="'私人网盘'"
    :showPath="true"
    @clickFile='clickFile'
    @dropFile='dropFile'
  >

  </file-browser>
</template>

<script>
import Type from '../typedescribe/type'
import mdui from 'mdui'
import FileBrowser from "../components/FileBrowser.vue"
import md5 from 'js-md5'
import FileQueue from '../global/FileQueue'
export default {
  components: { FileBrowser },
  name: 'PrivateDisk',
  data() {
    return {
    }
  },
  methods: {
    clickFile(e) {
      let newPath = location.href.replace(`/#/private`, '/pridown') + `/${encodeURIComponent(e.name)}`
      location.href = newPath
    },
    /**
     * 
     * @param {Type.DropItemInfo} fileInfo
     */
    dropFile(fileInfo) {
      for (let i = 0; i < fileInfo.files.length; i++) {
        const file = fileInfo.files[i]
        let target = fileInfo.path.join('/')
        target = fileInfo.target.type === 'file' ? target : target + fileInfo.target.name
        FileQueue.addFile({
          api: `upload/private/${target}`,
          file: file
        })
      }
    }
  }
}
</script>

<style>

</style>