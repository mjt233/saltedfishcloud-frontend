import { ResourceRequest } from '@/core/model'
export interface Encoder {
  name: string
  describe: string
  flag: string
  type: 'video' | 'audio' | 'subtitle'
}

export interface Format {
  /** 比特率 */
  bitRate: string,
  /** 持续时长（秒） */
  duration: number,
  /** 封装格式全名 */
  formatLongName: string,
  /** 封装格式名称 */
  formatName: string,
  /** 脚本数量 */
  nbPrograms: string,
  /** 流数量 */
  nbStreams: string,
  /** 文件大小（字节） */
  size: string,
  tags: { [key:string]:string}
}

export interface StreamInfo {
  /**
   * 流索引/编号
   */
  index: string;

  /**
  * 编码
  */
  codecName: string;

  /**
  * 编码详细名称信息
  */
  codecLongName: string;

  /**
  * 流编码类型
  */
  codecType: 'video' | 'audio' | 'subtitle';

  /**
  * 持续时长秒数
  */
  duration: number;

  /**
  * 视频宽度
  */
  width: number;

  /**
  * 视频高度
  */
  height: number;

  /**
  * 平均帧率
  */
  avgFrameRate: number;
  /**
  * 音频采样格式
  */
  sampleFmt: string;

  /**
  * 音频采样率
  */
  sampleRate: string;

  /**
  * 声道数
  */
  channels: number;

  /**
  * 声道布局
  */
  channelLayout: string;

  /**
  * 码率
  */
  bitRate: number;

  /**
  * 字幕语言
  */
  language: string;

  /**
  * 字幕标题
  */
  title: string;

  disposition: { [key:string]:string }

  /**
  * 其他标签
  */
  tags: { [key:string]:string }
}

export interface FFMpegInfo {
  version: string
  built: string
  configuration: string
  videoEncoders: Encoder[]
  audioEncoders: Encoder[]
  subtitleEncoders: Encoder[]
}

/**
 * 编码转换规则
 */
export interface EncodeConvertRule {
  /** 流索引 */
  index: string
  /** 规则方法 */
  method: 'copy' | 'convert'
  /** 使用的ffmpeg编码器 */
  encoder: string
  /** 规则类型 */
  type: 'video' | 'audio' | 'subtitle'
  /** 比特率 */
  bitRate?: string
}

/**
 * 视频章节时间点
 */
export interface Chapter {
  /**
   * 开始秒数
   */
  startTime: string

  /**
   * 结束秒数
   */
  endTime: string

  /**
   * 标题
   */
  title: string

  /**
   * id
   */
  id: string
}

export interface VideoInfo {
  streams: StreamInfo[]
  chapters: Chapter[],
  format: Format
}

export interface EncodeConvertTaskParam {
  source: ResourceRequest
  target: ResourceRequest
  rules: EncodeConvertRule[]
  format?: string
}