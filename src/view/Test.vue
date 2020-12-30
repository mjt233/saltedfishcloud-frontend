<template>
    <file-list
    :fileList="list">
    <div class="mdui-textfield">
        <input 
            class="mdui-textfield-input"
            placeholder="请输入要搜索的文件名"
            type="text"
            v-model="input"
            @keyup.enter="search"
        >
    </div>
    </file-list>
</template>

<script>
import mdui from 'mdui'
import FileList from '../components/FileList.vue'
export default {
  components: { FileList },
  data() {
      return {
        input: '',
        list: []
      }
  },
  methods: {
      search() {
          if (this.input.length < 2) {
              mdui.alert('内容太少！')
          } else {
            this.$axios.get('searchWithSqlInject?key='+encodeURIComponent(this.input)).then(e=>{
                this.list = e.data.data
                this.list.forEach(item => {
                    item.name += ' ' + item.path + ' ' + item.md5
                })
                
                console.log(e.data.data)
            })
          }
      }
  }

}
</script>

<style>

</style>