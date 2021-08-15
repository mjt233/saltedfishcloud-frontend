const inputElement = document.createElement('input')
inputElement.style.display = 'none'
inputElement.type = 'file'
document.documentElement.appendChild(inputElement)

/**
 * 打开文件选择框
 * 原理：动态创建一个type为file的input元素并设置好相应的事件回调后，插入到文档并通过JavaScript事件触发默认的click事件
 * @param {Object} options
 * @param {Boolean} options.multiple 是否允许多选文件
 * @returns {Promise<FileList>}
 * @author xiaotao233 <mjt233@qq.com>
 *
 */
export function openFileDialog({ multiple = false }) {
    const el = inputElement
    if (multiple) {
        el.setAttribute('multiple', 'multiple') //  多文件模式 即<input multiple="multiple" type="file">
    } else {
        el.removeAttribute('multiple')
    }
    return new Promise(res => {
        el.onchange = e => {
            document.documentElement.removeChild(el)
            res(el.files)
        }
        el.click()
    })
}
