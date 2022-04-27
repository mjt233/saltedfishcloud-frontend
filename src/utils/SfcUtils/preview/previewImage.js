import Vue from 'vue'
import ImagePreviewer from '@/components/Previewer/ImagePreviewer'
/**
 * 预览图像列表
 * @param {Array<Object>} fileList 待预览的文件列表
 * @param {Object} selectFile 默认预览的图像文件，主要依赖node和name属性
 * @returns 预览组件Vue实例
 */
export default function previewImage(fileList, selectFile) {
    /**
     * @type {Vue}
     */
    const vm = new Vue({
        render(h) {
            return h(ImagePreviewer, {
                props: {
                    fileList: fileList
                },
                on: {
                    close: () => {
                        document.body.removeChild(vm.$el)
                        vm.$destroy()
                        console.log('close')
                    }
                }
            })
        }
    }).$mount()

    document.body.appendChild(vm.$el)

    if (selectFile) {
        const previewer = vm.$children[0]
        const idx = previewer.getImgList().findIndex(e => {
            return e.name == selectFile.name
        })
        previewer.showImage(idx)
    }

    return vm
}
