import { StringFormatter } from 'sfc-common/utils/StringFormatter'
import { FormFieldType } from 'sfc-common/utils/FormUtils'
import { StringUtils } from 'sfc-common/utils/StringUtils'

function isNon(v: any) {
  return v === undefined || v === null || v === ''
}

/**
 * 预设的校验函数
 */
export namespace Validators {


  export function isNum(msg: string = '只能填写数字') {
    return (e: string) => {
      return isNon(e) || /^-?\d+(\.\d+)?$/.test(e) ? true : msg
    }
  }

  export function isNonNegativeNum(msg: string = '只能填写非负数字') {
    return (e: string) => {
      return isNon(e) || /^\d+(\.\d+)?$/.test(e) ? true : msg
    }
  }

  export function requireFile(msg: string = '请选择文件') {
    return (e: File[] | File) => {
      if (e instanceof Array) {
        if (e && e.length > 0) {
          return true
        } else {
          return msg
        }
      } else {
        return !!e
      }
    }
  }

  export function fileMaxSize(maxSize: number) {
    return (e: File[]) => {
      if (e && e.length) {
        const f = e.find(e => e.size > maxSize)
        if (f) {
          return '文件大小不能超过' + StringFormatter.toSize(maxSize)
        } else {
          return true
        }
      } else {
        return true
      }
    }
  }

  export function notNull(msg: string = '不能为空') {
    return (e: FormFieldType) => !!e || msg
  }

  export function minLen(msg: string | undefined | null, len: number) {
    return (e: FormFieldType) => ('' + e).length >= len || msg || '长度不能小于' + len + '个字符'
  }

  export function maxLen(msg: string | undefined | null, len: number) {
    return (e: FormFieldType) => ('' + e).length <= len || msg || '长度不能大于' + len + '个字符'
  }

  export function isEmail(msg: string = '不是有效的邮箱格式') {
    return (e: FormFieldType) => StringUtils.isEmail('' + e) || msg
  }

  export function minNum(min: number) {
    return (e: FormFieldType) => Number(e) < min ? '不能小于' + min : true
  }

  export function maxNum(max: number) {
    return (e: FormFieldType) => Number(e) > max ? '不能大于' + max : true
  }

  export function isRegex(msg = '不是有效的正则表达式') {
    return (e: FormFieldType) => {
      const val = e ? e.toString() : ''
      try {
        new RegExp(val)
      } catch(err) {
        return msg
      }
      return true
    }
  }
  
  export function isMatchRegex(regex: string, msg?: string) {
    return (e: FormFieldType) => {
      try {
        if(!e.toString().match(regex)) {
          return msg || '不满足正则表达式：' + regex
        }
        return true
      } catch(err) {
        return (err as any).toString()
      }
    }
  }
}