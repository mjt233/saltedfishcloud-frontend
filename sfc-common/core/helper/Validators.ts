import { FormFieldType } from 'sfc-common/utils/FormUtils'
import { StringUtils } from 'sfc-common/utils/StringUtils'

export namespace Validators {
  export function notNull(msg: string = '不能为空') {
    return (e: FormFieldType) => !!e || msg
  }

  export function minLen(msg: string, len: number) {
    return (e: FormFieldType) => ('' + e).length >= len || msg
  }

  export function maxLen(msg: string, len: number) {
    return (e: FormFieldType) => ('' + e).length <= len || msg
  }

  export function isEmail(msg: string = '不是有效的邮箱格式') {
    return (e: FormFieldType) => StringUtils.isEmail('' + e) || msg
  }

  export function minNum(min: number) {
    return (e: FormFieldType) => e < min ? '不能小于' + min : true
  }

  export function maxNum(max: number) {
    return (e: FormFieldType) => e > max ? '不能大于' + max : true
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