<template>
    <file-handler
        :uid="0"
        :modifiable="isModifiable"
    >

    </file-handler>
</template>

<script>
import FileHandler from '../components/FileHandler.vue'
export default {
  components: { FileHandler },
  computed: {
    userInfo() {
      return this.$store.getters.userInfo
    },
    isModifiable() {
      return this.userInfo != null && this.userInfo.type == 1
    }
  }
}
</script>

<style>

</style>