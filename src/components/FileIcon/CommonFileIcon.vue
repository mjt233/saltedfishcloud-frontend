<template>
    <img v-if="src" :src="src" :type="type" :file-name="fileName">
</template>

<script>
import IconProvider from './FileIconProvider'
export default {
    name: 'commonFileIcon',
    props: {
        // 文件后缀名，优先级最高
        type: {
            type: String
        },
        // 文件名，用于提取后缀名，优先级次之
        fileName: {
            type: String
        },
        /**
         * 是否为目录
         */
        dir: {
            type: Boolean
        }
    },
    computed: {
        src() {
            if (this.dir) {
                return IconProvider.getIconResource('', true)
            }
            let type = null
            if (this.type) {
                type = this.type
            } else if (this.fileName) {
                type = this.fileName.split('.').pop()
            }
            if (type == null) {
                return null
            }

            type = type.toLowerCase()

            return IconProvider.getIconResource(type, false)
        }
    }
}
</script>

<style>

</style>
