<template>
    <div>
        <img v-show="imgSrc" :src="imgSrc" ref="img" class="img" />
    </div>
</template>

<script>
import API from '@/api'
export default {
    props: {
        md5: {
            type: String
        }
    },
    data() {
        return {
            imgSrc: null
        }
    },
    mounted() {
        this.updateSrc()
        this.$refs.img.addEventListener('error', () => {
            this.imgSrc = null
            this.$emit('error', this.md5)
        })
        this.$refs.img.addEventListener('load', () => {
            this.$emit('load', this.md5)
        })
    },
    methods: {
        updateSrc() {
            this.imgSrc = this.axios.defaults.baseURL + '/' + API.resource.getThumbnail(this.md5).url
        }
    },
    watch: {
        md5() {
            this.updateSrc()
        }
    }
}
</script>

<style scoped>
.img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}
</style>
