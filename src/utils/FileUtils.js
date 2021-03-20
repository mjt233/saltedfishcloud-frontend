const md5 = require("js-md5")

/**
 * 文件实用类工具
 */
let FileUtils = {
    /**
     * @callback GetFileListCallback
     * @param {FileList} filelist 文件列表
     */

    /**
     * 打开文件选择框
     * 原理：动态创建一个type为file的input元素并设置好相应的事件回调后，插入到文档并通过JavaScript事件触发默认的click事件
     * @param {Object} options
     * @param {Boolean} options.multiple 是否允许多选文件
     * @returns {Promise<FileList>}
     * @author xiaotao233 <mjt233@qq.com>
     * 
     */
    openFileDialog ({multiple = false} = {}) {
      /**
       * 若用户上次执行该函数后但点击取消，则上次创建的input未被删除，这里可重复利用同时也防止了ID冲突
       */
      let el = document.querySelector('#FileDialogmjt233')
      if (el === null) {
        el = document.createElement('input')
        el.style.display = 'none'                 //  不可视，不占据文档流空间
        el.id = 'FileDialogmjt233'                //  设置一个id方便获取
        el.type = 'file'                          //  设为file类型的input
        if (multiple) {
          el.setAttribute('multiple', 'multiple')   //  多文件模式 即<input multiple="multiple" type="file">
        }
        document.documentElement.appendChild(el)  //  插入到文档流，因为display为none，因此不会破坏文档布局和显示
      }
      return new Promise( res => {
        el.onchange = e => {
          document.documentElement.removeChild(el)
          res(el.files)
        }
        el.click()
      })
    },

    

    /**
    * @typedef {Object} Prog
    * @property {Number} loaded
    * @property {Number} total
    */

    /**
     * @callback ProgCallback
     * @param {Prog} prog
     */

    /**
     * @callback Md5Callback
     * @param {String} res
     */

    /**
     * @callback ErrorCallback
     * @param {ProgressEvent<FileReader>} res
     */

    /**
     * 计算文件的md5
     * @param {File} file     文件对象
     * @param {Object} options  选项
     * @param {Md5Callback} options.success 文件读取成功且完成md5计算时执行的回调
     * @param {ErrorCallback} options.error 文件读取失败时执行的回调
     * @param {ProgCallback} options.prog   文件读取和md5计算中执行的回调
     * @author xiaotao233 <mjt233@qq.com>
     */
    computeMd5(file, {success, error, prog}) {
      let md5obj = md5.create()

      // 按每16MiB分块读取
      let chunkSize = 1024*1024*16

      // 文件分块读取起始位置
      let start = 0

      // 文件分块读取结束位置
      let end = Math.min(file.size, chunkSize)

      // 声明一个加载文件的函数，该函数将被递归调用
      /**
       * 分块读取文件并读取md5的核心函数
       * @type {Function}
       */
      let load = () => {
        let reader = new FileReader

        // 一个分块完成读取
        reader.onload = () => {

          // 每完成一块读取 就update一次md5
          md5obj.update(reader.result)
          if (end !== file.size) {

            // 下次读取从上次读取结束位置开始
            start = end

            // 结束位置为开始位置 + 块大小或文件结尾
            end = Math.min(end + chunkSize, file.size)

            // 执行继续读取
            load()
          } else {
            
            // 加载完成 取结果并执行回调
            // 注：当success为undefined, null或false时，不执行success回调，此处利用了条件逻辑短路，下同
            success && success(md5obj.hex())
          }
        }

        // 一个分块读取中
        reader.onprogress = e => {
          prog && prog({
              total: file.size,
              loaded: start + e.loaded
            })
        }

        // 一个分块读取错误
        reader.onerror = e => {
          error && error(e)
        }
        reader.readAsArrayBuffer(file.slice(start, end))
      }
      // 开始读取文件并计算md5
      load()
    }
}
export default FileUtils