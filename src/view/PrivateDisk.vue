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
import qs from 'qs'
export default {
  components: { FileBrowser },
  name: 'PrivateDisk',
  data() {
    return {
      loading: false
    }
  },
  mounted () {
  },
  methods: {
    /**
     * 文件被点击时执行的回调
     */
    clickFile(e) {
      let newPath = location.href.replace(`/#/private`, '/pridown') + `/${encodeURIComponent(e.name)}`
      location.href = newPath
    },
    /**
     * 有文件被拖到文件列表时执行的回调
     * @param {Type.DropItemInfo} fileInfo
     */
    addUploadFile(fileInfo) {
      for (let i = 0; i < fileInfo.files.length; i++) {
        const file = fileInfo.files[i]
        let target = fileInfo.path.join('/')
        target = fileInfo.target.type === 'file' ? target : target + fileInfo.target.name
        FileQueue.addFile({
          api: `private/${target}`,
          file: file,
          path: fileInfo.path
        })
      }
    },
    /**
     * 文件列表上传按钮被点击时执行的回调
     * @param {Type.DropItemInfo} info
     */
    upload (info) {
      for (let i = 0; i < info.files.length; i++) {
        const file = info.files[i]
        let target = info.path.join('/')
        FileQueue.addFile({
          api: `private/${target}`,
          file: file,
          params: {},
          path: info.path
        })
      }
    },
    /**
     * 文件列表删除按钮被点击时执行的回调
     * @param {Type.FileInfo[]} itemInfo
     */
    deleteItem (itemInfo) {
      let fileList = itemInfo.map(file => file.name)
      let path = itemInfo[0].path.join('/')
      let url = `delete/private/${path}`
      this.loading = true
      /**
       * 请求完成时的回调
       * @param {String} msg 提示信息
       */
      let cb = msg => {
        this.loading = false
        mdui.snackbar(msg,{
          position: 'bottom'
        })
        this.$refs.browser.loadList()
      }
      /**
       * 发起删除请求
       */
      axios.delete(`private/${path}`, {
        data: {fileName: fileList},
        headers: {'Content-Type': 'application/json;charset=utf-8'}
      }).then(() => {
        cb('删除成功')
      }).catch(() => {
        cb('删除失败')
      })
    },
    /**
     * 文件列表创建目录按钮被点击时执行的回调函数
     */
    createFolder (info) {
      let path = info.path.join('/')
      let url = `private/${path}`
      this.loading = true
      this.$axios.post(url, {
        name: info.name
      }).then(e=>{
        this.loading = false
        this.$refs.browser.loadList()
      })
    }
  }
}
</script>

<style>

</style>