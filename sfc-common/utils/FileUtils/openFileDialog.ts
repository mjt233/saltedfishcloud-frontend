

/**
 * 打开文件选择框
 * 原理：动态创建一个type为file的input元素并设置好相应的事件回调后，插入到文档并通过JavaScript事件触发默认的click事件
 * @param multiple 是否允许多选文件
 * @param accept 接受的文件类型，如：'.jar'
 * @returns {Promise<FileList>}
 * @author xiaotao233 <mjt233@qq.com>
 *
 */
export function openFileDialog( multiple = false, accept?: string): Promise<FileList> {
  const el = document.createElement('input')
  el.style.display = 'none'
  el.type = 'file'
  if (multiple) {
    el.setAttribute('multiple', 'multiple') //  多文件模式 即<input multiple="multiple" type="file">
  }
  if (accept) {
    el.accept = accept
  } else {
    el.accept = ''
  }
  return new Promise((res, reject) => {
    const cb = () => {
      removeCb()
      reject('cancel')
    }
    const removeCb = () => {
      window.removeEventListener('mousemove', cb)
      window.removeEventListener('keydown', cb)
      window.removeEventListener('mousedown', cb)
    }
    window.addEventListener('mousemove', cb)
    window.addEventListener('keydown', cb)
    window.addEventListener('mousedown', cb)
    el.onchange = e => {
      removeCb()
      res(el.files as FileList)
    }
    el.click()
  })
}



/**
 * 打开目录选择框
 * @param multiple 是否允许多选文件
 */
export function openDirDialog(multiple = false): Promise<FileList> {
  const el = document.createElement('input')
  el.style.display = 'none'
  el.type = 'file'
  el.setAttribute('webkitdirectory', '')
  if (multiple) {
    el.setAttribute('multiple', 'multiple') //  多文件模式 即<input multiple="multiple" type="file">
  }
  return new Promise(res => {
    el.onchange = e => {
      res(el.files as FileList)
    }
    el.click()
  })
}