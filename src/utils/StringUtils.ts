export interface RandomStrOption {
  /**
   * 是否带数字
   */
  withNumber: boolean
}

export namespace StringUtils {
  

  /**
   * 判断输入的字符串是否为有效的邮箱格式
   * @param {String} email 待验证的邮箱地址
   */
  export function isEmail(email: string) {
    return email.match(/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/) != null
  }
  /**
   * 取随机字符串
   * @param {Number} len 字符长度
   * @param {RandomStrOption} opt 选项
   * @return {String}
   */
  export function getRandomStr(len: number, opt: RandomStrOption) {
    let pattern = 'QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm'
    if (opt !== undefined && opt.withNumber == true) {
      pattern += '1234567890'
    }
    let res = ''
    for (let i = 0; i < len; i++) {
      const index = (Math.random() * 10000) % pattern.length
      res += pattern.charAt(index)
    }
    return res
  }
  /**
   * 生成分享文本
   * @param {Object} shareInfo 分享信息对象
   * @returns {String}
   */
  export function generateShareText(shareInfo: any) {
    let res = `呐呐呐(。・∀・)ノ，我用咸鱼云向你分享了文件：${shareInfo.name}\n链接：${generateShareLink(shareInfo)}`
    if (shareInfo.needExtractCode) res += `\n提取码：${shareInfo.extractCode}\n`
    return res
  }
  /**
   * 生成分享链接
   * @param {Object} shareInfo 分享信息对象
   * @returns {String}
   */
  export function generateShareLink(shareInfo: any) {
    return `${location.origin}/#/s/${shareInfo.id}/${shareInfo.verification}`
  }
  /**
   * 对URL字符串的每个节点进行一次URL编码转换
   * @param {String} input 表示资源路径的字符串
   */
   export function encodeURLPath(input: string) {
     return input.split('/').map(e => encodeURIComponent(e)).join('/').replace(/\/\/+/g, '/')
   }
  /**
   * 将多个路径拼接为一个路径（自动添加/或不添加/）
   * @param  {...String} path 待拼接的路径
   */
  export function appendPath(...path: string[]) {
    let res = ''
    path.forEach(e => {
      if (res.length == 0) {
        res += e
        return
      }
      res += res.endsWith('/') ? e : (e.startsWith('/') ? e : ('/' + e))
    })
    return res
  }

}