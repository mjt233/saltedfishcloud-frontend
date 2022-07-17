import { FormFieldType } from '@/utils/FormUtils'
import { StringUtils } from '@/utils/StringUtils'

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
}