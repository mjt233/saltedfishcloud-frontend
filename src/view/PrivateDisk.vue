<template>
  <search-result 
    v-if="searchMode"
    :searchKey='searchKey'
    :uid='userInfo.id'
    :rootLabel='"私人网盘"'
    @back='searchMode = false'
    @clickFile='fileClick'
    @clickDir='dirClick'
  >
    <div class="mdui-typo">
      <a>返回</a>
    </div>
  </search-result>
  <file-browser
    v-else-if="!searchMode && hasLogin"
    :api="`fileList/${userInfo.id}`"
    :uid="userInfo.id"
    :prefix="'private'"
    :rootName="'私人网盘'"
    :showPath="true"
    :pathLabel="'当前路径：'"
    :loadingControl="loading"
    :showToolBar="true"
    @clickFile='clickFile'
    @dropFile='addUploadFile'
    @upload='upload'
    @delete='deleteItem'
    @createFolder='createFolder'
    @rename='rename'
    @search='search'
    ref='browser'
  >
  </file-browser>
  <container class="mdui-typo" v-else>
    <h3>未登录，请先<router-link to="/login">登录</router-link> </h3>
  </container>
</template>

<script>
import Type from '../typedescribe/type'
import mdui from 'mdui'
import FileBrowser from "../components/FileBrowser.vue"
import FileQueue from '../global/FileQueue'
import axios from 'axios'
import FileList from '../components/FileList.vue'
import Container from "@/components/Container.vue"
import SearchResult from '@/components/SearchResult'
import apiConfig from '../api/apiConfig'
export default {
  components: { FileBrowser, FileList, Container, SearchResult },
  name: 'PrivateDisk',
  data() {
    return {
      loading: false,
      searchRes: [],
      searchMode: false,
      searchKey: '测试'
    }
  },
  mounted () {
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo
    },
    hasLogin() {
      return this.$store.state.userInfo != null
    }
  },
  methods: {
    fileClick(path) {
      let url = `/download/${this.userInfo.id}/${path}`
      location.href = url
    },
    dirClick(path) {
      this.searchMode = false
      location.href = '/#/private/' + path
    },
    search(key) {
      this.searchMode = !this.searchMode
      this.searchKey = key
    },
    rename(info) {
      let url = `rename/private/${info.path.join('/')}`
      this.loading = true
      this.$axios.post(url, {
        oldName: info.old,
        newName: info.new
      }).then(e => {
        this.$refs.browser.loadList()
        mdui.snackbar('重命名成功')
        this.loading = false
      }).catch(e => {
        if (e.code === -4) {
          mdui.snackbar('文件名冲突')
        } else {
          mdui.snackbar(`出错：${e.msg}`)
        }
        this.loading = false
      })
    },
    /**
     * 文件被点击时执行的回调
     */
    clickFile(e) {
      let filePath = location.href.replace(/^(.*)\/private/, '/') + `/${encodeURIComponent(e.name)}`
      let newPath = `${apiConfig.server}/download/${this.userInfo.id}${filePath.replace(/\/+/g, '/')}`
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
      }).catch(e => {
        mdui.alert(e.msg, () => {
          this.loading = false
          this.$refs.browser.loadList()
        })
      })
    }
  }
}
</script>

<style>

</style>