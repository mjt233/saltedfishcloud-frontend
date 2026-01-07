function paddingZero(input: number) {
  if (input < 10) {
    return '0' + input
  } else {
    return '' + input
  }
}
const formatExtNameMapping: {[k:string]: string} = {
  'matroska': 'mkv',
  'mpeg': 'mpg',
  'mpegts': 'ts',
  'quicktime': 'mov',
  'asf': 'wmv',
  'av1': 'mp4',
  'rv10': 'rm',      // RealVideo 1.0
  'rv20': 'rm',      // RealVideo 2.0
  'theora': 'ogv',   // Theora视频
}
const extNameFormatMapping: {[k:string]: string} = {
  'mkv': 'matroska',
  'mpg': 'mpeg',
  'ts': 'mpegts',
  'm2ts': 'mpegts',
  'wmv': 'asf',
  'ogv': 'theora',
  'mp4': 'mp4',
  'flv': 'flv',
  'rmvb': 'rm'
}

const supportSubtitleTypes = new Set(['ssa','ass', 'webvtt', 'vtt', 'subrip', 'srt', 'sup','hdmv_pgs_subtitle'])

export namespace VEUtils {
  export function formatBitRate(rawInput: string | number) {
    const input = Number(rawInput)
    if (input < 1000) {
      return input + 'bps'
    } else if (input < 1000000) {
      return (Number(input) / 1000).toFixed(2) + 'Kbps'
    } else if (input < 1000000000) {
      return (Number(input) / 1000000).toFixed(2) + 'Mbps'
    } else {
      return input
    }
  }

  export function formatDuration(input: string | number) {
    const sec = Number(input)
    const h = paddingZero(Math.floor(sec/3600))
    const m = paddingZero(Math.floor(sec/60%60))
    const s = paddingZero(Math.floor(sec%60))
    return `${h}:${m}:${s}`
  }

  /**
   * 获取视频格式format对应的文件拓展名
   * @param format 视频信息的format
   * @returns 对应的文件名拓展名
   */
  export function getFormatExtName(format: string) {
    return formatExtNameMapping[format]
  }

  /**
   * 获取视频文件拓展名使用的对应的封装器muxer
   * @param extName 文件拓展名
   * @returns 对应的ffmpeg muxer封装格式
   */
  export function getExtNameMuxer(extName: string) {
    return extNameFormatMapping[extName] || extName
  }

  /**
   * 检查是否为系统当前支持播放的字幕类型
   * @param codecName 字幕编码类型
   */
  export function isSupportSubtitleType(codecName: string) {
    return supportSubtitleTypes.has(codecName.toLocaleLowerCase())
  }

  /**
   * 服务器支持的统一转换后的字幕类型
   */
  export type ServerSubtitleType = 'ass' | 'webvtt' | 'sup'

  /**
   * 根据ffmpeg的字幕编码类型获取对应的服务器处理类型
   * @param codecName ffmpeg的字幕编码器类型
   * @returns 针对codecName服务器转换返回的类型。简单文本字幕webvtt，复杂字幕ass，图片字幕sup
   */
  export function getSubtitleServerType(codecName: string): ServerSubtitleType {
    if (codecName === 'ass' || codecName === 'ssa') {
      return 'ass'
    } else if (codecName === 'webvtt' || codecName === 'srt' || codecName === 'subrip') {
      return 'webvtt'
    } else {
      return 'sup'
    }
  }
}