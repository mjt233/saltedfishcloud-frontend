<template>
  <div ref="root" class="root">
    <drawer ref="drawer" @exit="exit"></drawer>
    <sf-header ref="header" />
    <transition on name="route-switch" mode="out-in">
        <router-view />
    </transition>
  </div>
</template>

<script>
import SfHeader from '@/components/layout/SfHeader.vue'
import { FileQueueHandler as FileQueue } from '@/service/FileUpload/FileUploadQueue/FileQueueHandler'
import Drawer from '@/components/layout/Drawer.vue'
import GlobalHandler from '@/GlobalHandler.js'
export default {
    name: 'index',
    components: {
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
            GlobalHandler.logout(this)
            if (document.documentElement.clientWidth < 1024) {
                this.drawer.close()
            }
        }
    }
}
</script>
