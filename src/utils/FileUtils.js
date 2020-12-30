


const FileUtils = {
    /**
     * @callback getFileListCallback
     * @param {FileList} filelist 文件列表
     */
    /**
     * 打开文件选择框
     * @param {getFileListCallback} callback 选择文件后触发的回调函数
     */
    openFileDialog (callback) {
      var el = document.querySelector('#FileDialog')
      if (el === null) {
        el = document.createElement('input')
        el.style.display = 'none'
        el.id = 'FileDialog'
        el.setAttribute('multiple', 'multiple')
        el.type = 'file'
        document.documentElement.appendChild(el)
      }
      el.onchange = e => {
        callback(el.files)
        document.documentElement.removeChild(el)
      }
      el.click()
    }
}
module.exports = FileUtils