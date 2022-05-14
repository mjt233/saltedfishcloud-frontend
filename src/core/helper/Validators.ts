import { StringUtils } from '@/utils/StringUtils'

export namespace Validators {
  export function notNull(msg: string = '不能为空') {
    return (e: string) => !!e || msg
  }

  export function minLen(msg: string, len: number) {
    return (e: string) => e.length >= len || msg
  }

  export function maxLen(msg: string, len: number) {
    return (e: string) => e.length <= len || msg
  }

  export function isEmail(msg: string = '不是有效的邮箱格式') {
    return (e: string) => StringUtils.isEmail(e) || msg
  }
}