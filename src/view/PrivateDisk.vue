<template>
  <file-browser
    :api="'getPrivateList'"
    :prefix="'private'"
    :rootName="'私人网盘'"
    :showPath="true"
    :pathLabel="'当前路径：'"
    :loadingControl="loading"
    @clickFile='clickFile'
    @dropFile='addUploadFile'
    @upload='upload'
    @delete='deleteItem'
    @createFolder='createFolder'
    ref='browser'
  >

  </file-browser>
</template>

<script>
import Type from '../typedescribe/type'
import mdui from 'mdui'
import FileBrowser from "../components/FileBrowser.vue"
import md5 from 'js-md5'
import FileQueue from '../global/FileQueue'
import FileUtils from '../utils/FileUtils'
import axios from 'axios'
export default {
  components: { FileBrowser },
  name: 'PrivateDisk',
  data() {
    return {
      loading: false
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
    addUploadFile(fileInfo) {
      console.log(fileInfo)
      for (let i = 0; i < fileInfo.files.length; i++) {
        const file = fileInfo.files[i]
        let target = fileInfo.path.join('/')
        target = fileInfo.target.type === 'file' ? target : target + fileInfo.target.name
        FileQueue.addFile({
          api: `upload/private/${target}`,
          file: file
        })
      }
    },
    /**
     * @param {Type.DropItemInfo} info
     */
    upload (info) {
      for (let i = 0; i < info.files.length; i++) {
        const file = info.files[i]
        let target = info.path.join('/')
        FileQueue.addFile({
          api: `upload/private/${target}`,
          file: file,
          params: {}
        })
      }
    },
    /**
     * @param {Type.FileInfo} itemInfo
     */
    deleteItem (itemInfo) {
      let target = itemInfo.path.join('/')
      this.loading = true
      let cb = msg => {
        this.loading = false
        mdui.snackbar(msg,{
          position: 'bottom'
        })
        this.$refs.browser.loadList()
      }
      axios.post(`delete/private/${target}/${itemInfo.name}`).then(() => {
        cb('删除成功')
      }).catch(() => {
        cb('删除失败')
      })
    },
    createFolder (info) {
      let path = info.path.join('/')
      let url = `mkdir/private/${path}`
      this.$axios.post(url, {
        name: info.name
      }).then(e=>{
        this.$refs.browser.loadList()
      })
    }
  }
}
</script>

<style>

</style>