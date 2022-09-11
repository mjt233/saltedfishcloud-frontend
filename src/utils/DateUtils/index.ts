/**
 * 获取指定天数对应的秒数
 * @param day 天数
 */
export function getSecOfDay(day: number) {
  return day * 24 * 60 * 60
}