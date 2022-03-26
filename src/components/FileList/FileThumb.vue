<template>
    <div>
        <img v-show="imgSrc" :src="imgSrc" ref="img" class="img" v-if="show" />
    </div>
</template>

<script>
import API from '@/api'
export default {
    name: 'file-thumb',
    props: {
        /**
         * 文件资源的MD5
         */
        md5: {
            type: String
        },
        /**
         * 源文件类型（拓展名），优先级最高
         */
        type: {
            type: String
        },
        /**
         * 文件名，内部从文件名中提取拓展名（优先级低于type）
         */
        name: {
            type: String
        },
        /**
         * 检测到变化时刷新的属性
         */
        watchAttr: {
            type: Object
        }
    },
    data() {
        return {
            imgSrc: null,
            show: true
        }
    },
    mounted() {
        this.updateSrc()
        this.$refs.img.addEventListener('error', async() => {
            this.imgSrc = null
            this.$emit('error', this.md5)
        })
        this.$refs.img.addEventListener('load', async() => {
            this.$emit('load', this.md5)
        })
    },
    methods: {
        updateSrc() {
            const resourceType = (this.type ? this.type : this.name.split('.').pop()).toLowerCase()
            this.imgSrc = this.axios.defaults.baseURL + '/' + API.resource.getThumbnail(this.md5, resourceType).url
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
