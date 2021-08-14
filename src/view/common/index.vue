<template>
  <div ref="root" class="root">
    <drawer ref="drawer" @exit="exit"></drawer>
    <sf-header ref="header" />
    <transition on name="route-switch" mode="out-in">
        <router-view />
    </transition>
    <file-upload-dialog></file-upload-dialog>
  </div>
</template>

<script>
import mdui from 'mdui'
import SfHeader from '@/components/layout/SfHeader.vue'
import FileQueue from '@/global/FileQueue'
import FileUploadDialog from '@/components/FileUploadDialog/index.vue'
import Store from '@/Store'
import API from '@/api/API'
import Drawer from '@/components/layout/Drawer.vue'
export default {
    name: 'index',
    components: {
        FileUploadDialog,
        SfHeader,
        Drawer
    },
    data() {
        return {
            drawer: null,
            FileQueue: FileQueue.queue
        }
    },
    created() {
        window.addEventListener('resize', this.setAppHeight)
    },
    destroyed() {
        window.removeEventListener('resize', this.setAppHeight)
    },
    mounted() {
        this.header = document.querySelector('header')
        this.$store.commit('setDrawer', this.$refs.drawer.getDrawerInst())
        this.drawer = this.$refs.drawer.getDrawerInst()
        this.setAppHeight()
        if (this.$route.params.close) {
            this.drawer.close()
        }
    },
    methods: {
        setAppHeight() {
            const h = document.documentElement.clientHeight - this.header.offsetHeight + 'px'
            this.$refs.root.style.minHeight = h
            this.$refs.root.style.height = h
        },
        exit() {
            localStorage.clear()
            Store.commit('setToken', null)
            Store.commit('setAvatarURL', API.getServer() + '/api/' + API.user.getAvatar().url)
            mdui.snackbar('退出成功')
            if (this.$route.name == 'privateDisk' || this.$route.name == 'my') {
                this.$router.push('/login')
            }
            if (document.documentElement.clientWidth < 1024) {
                this.drawer.close()
            }
        }
    }
}
</script>

<style>

.route-switch-enter-active {
  transition: all .1s ease-in;
}
.route-switch-leave-active {
  transition: all .1s ease-out;
}
.route-switch-enter,
.route-switch-leave-to {
  transform: scale(1.03);
  filter: blur(5px);
}
</style>
