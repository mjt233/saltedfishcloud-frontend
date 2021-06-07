<template>
    <file-handler
        :uid="0"
        :modifiable="isModifiable"
        :path="path"
    >

    </file-handler>
</template>

<script>
import FileHandler from '../../components/FileHandler.vue'
export default {
  components: { FileHandler },
  computed: {
    path() {
      return this.$route.params.pathMatch || '/'
    },
    userInfo() {
      return this.$store.getters.userInfo
    },
    isModifiable() {
      return this.userInfo != null && this.userInfo.type == 1
    },
    userInfo() {
        return this.$store.getters.userInfo
    }
  }
}
</script>

<style>

</style>