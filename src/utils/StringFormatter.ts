
export namespace StringFormatter {
  /**
     * 将字节大小转化为可阅读的单位
     * @param {Number} size 文件大小（单位字节）
     * @param {Number=} B Byte显示为B
     * @return {String}
     */
  export function toSize(size: any, B = false) {
    if (size == null || size == undefined) {
      return ''
    }
    let showSize = size
    let suffix = B ? 'Byte' : 'B'
    if (size > 1024 && size <= 1048576) {
      suffix = 'KiB'
      showSize = size / 1024
    } else if (size > 1048576 && size <= 1073741824) {
      suffix = 'MiB'
      showSize = size / 1048576
    } else if (size > 1073741824) {
      suffix = 'GiB'
      showSize = size / 1073741824
    }
    return Number(showSize).toFixed(2) + suffix
  }
  /**
     * 将Unix时间戳格式化为方便阅读的格式
     * @param {Number|String} inputDate Unix时间戳（毫秒）
     * @returns {String}
     */
  export function toDate(inputDate: number | string | Date) {
    const date = new Date(inputDate)
    var month = date.getMonth() + 1
    var day = date.getDate()
    return `${date.getFullYear()}-${fillLength(month, 2)}-${fillLength(day, 2)} ${fillLength(date.getHours(),2)}:${fillLength(date.getMinutes(), 2)}`
  }
  /**
     * 将字符串填充至指定长度
     * @param {String|Number} str 待处理的字符串
     * @param {Number} len 目标长度
     * @param {'left'|'right'} position 占位字符填充位置
     * @param {String} char 占位字符
     */
  export function fillLength(str: string | number, len: number, position = 'left', char = '0') {
    const input = '' + str
    if (input.length >= len) {
      return str
    }
    const fillLength = len - input.length
    let fillBody = ''
    for(let i = 0; i < fillLength; i++) {
      fillBody += char
    }
    if (position == 'left') {
      return fillBody + input
    } else {
      return input + fillBody
    }
  }
}
