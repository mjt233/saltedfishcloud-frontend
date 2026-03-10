
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
    if (res.endsWith('/')) {
      if (e.startsWith('/')) {
        res += e.substring(1)
      } else {
        res += e
      }
    } else if (e.startsWith('/')) {
      res += e
    } else {
      res += ('/' + e)
    }
  })
  return res
}