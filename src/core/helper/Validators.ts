export namespace Validators {
  export function notNull(msg: string) {
    return (e: string) => !!e || msg
  }

  export function minLen(msg: string, len: number) {
    return (e: string) => e.length >= len || msg
  }
}