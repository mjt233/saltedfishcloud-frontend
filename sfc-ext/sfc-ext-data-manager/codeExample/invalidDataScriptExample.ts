import { CodeExample } from './type'

/**
 * Groovy 数据筛选过滤样例
 */
export const GroovyFilterExample = [
  {
    id: 'filterImageModel',
    label: '按拍摄设备过滤图片',
    content: `if (typeCheckResult == null || typeCheckResult.detail.metadata == null) {
  return false
}

// 案例：筛选拍摄设备为 Xiaomi 14 的照片
return typeCheckResult.detail.metadata.cameraModel == 'Xiaomi 14'
`
  },
  {
    id: 'filterVideoModel',
    label: '按拍摄设备过滤视频',
    content: `if (typeCheckResult == null || typeCheckResult.detail.metadata == null || typeCheckResult.detail.metadata.inlineMetadata == null) {
  return false
}

// 案例：筛选拍摄设备为 Xiaomi 14 的视频
return typeCheckResult.detail.metadata.inlineMetadata.contains('Xiaomi 14')
`
  }
] as CodeExample[]

export const GroovyClaimExample = [
  {
    id: 'claimNameByLastModifiDate',
    label: '按修改日期命名文件',
    content: `// 预览时留意服务器时区导致的日期问题，如果是UTC0时区则需要在格式化日期时手动计算一下偏移
def utc8Date = new Date(record.lastModified.getTime() + 8 * 3600 * 1000);

// 将文件命名为 VID_日期.扩展名(typeCheckResult.detail.extension已带'.')
return [
    name: 'VID_' + TypeUtils.dateToString(utc8Date, 'yyyyMMdd_HHmmss') + typeCheckResult.detail.extension
]`
  }
] as CodeExample[]