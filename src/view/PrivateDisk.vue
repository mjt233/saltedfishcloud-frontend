<template>
    <file-handler
        :uid="userInfo.id"
    >

    </file-handler>
</template>

<script>
import FileHandler from '../components/FileHandler.vue'
export default {
    components: { FileHandler },
    computed: {
        userInfo() {
            return this.$store.state.userInfo
        }
    }
}
</script>

<style>

</style>