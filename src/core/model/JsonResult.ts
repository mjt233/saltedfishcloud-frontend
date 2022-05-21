export interface JsonResult<T> {
  code: number,
  msg: string,
  data: T
}