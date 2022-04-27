import FileSelector from '@/components/FileSelector'
import Vue from 'vue'

/**
 * @typedef {Object} SelectFileParam
 * @property {Number=} uid 用户id，默认是0
 * @property {String=} username 用户名
 * @property {String=} title 对话框标题
 * @property {String=} path 初始路径
 * @property {Function} fileFilter 文件信息过滤器
 *
 */

/**
 * 打开文件选择
 * @param {SelectFileParam} param
 */
export default function selectFile(param) {
    return new Promise((resolve, reject) => {
        if (param == null || param == undefined) {
            param = {}
        }
        let confirm = false
        const componentProps = {
            uid: param.uid || 0,
            username: param.username || '',
            title: param.title || '选择文件',
            path: param.path || '/',
            fileFilter: param.fileFilter
        }
        if (!componentProps.path.startsWith('/')) {
            componentProps.path = '/' + componentProps.path
        }
        const vm = new Vue({
            render(h) {
                return h(FileSelector, {
                    props: componentProps,
                    on: {
                        confirm(e) {
                            resolve(e)
                            confirm = true
                            vm.$children[0].showDialog = false
                        },
                        close() {
                            setTimeout(() => {
                                // 由于因确认触发的窗口关闭也会触发close事件，使用confirm作为标志来判断是取消还是确认
                                if (!confirm) {
                                    reject(new Error('cancel'))
                                }
                                document.body.removeChild(vm.$el)
                                vm.$destroy()
                            }, 200)
                        }
                    }
                })
            }
        }).$mount()

        document.body.appendChild(vm.$el)
        setTimeout(() => {
            vm.$children[0].showDialog = true
        }, 0)
    })
}
