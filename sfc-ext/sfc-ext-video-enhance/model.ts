import { AsyncTaskRecord  } from 'sfc-common/model/AsyncTaskRecord'
import { ResourceRequest,IdType, CommonProgress } from 'sfc-common'
import { VEUtils } from './core/VEUtils'
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

export interface EncodeConvertTaskLog {
  id: string

  taskId: string

  taskLog: string
}

export interface Subtitle {
  title: string

  url: string

  type: VEUtils.ServerSubtitleType

  isDefault?: boolean
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
  width?: number;

  /**
  * 视频高度
  */
  height?: number;

  /**
  * 平均帧率
  */
  avgFrameRate?: number;
  /**
  * 音频采样格式
  */
  sampleFmt?: string;

  /**
  * 音频采样率
  */
  sampleRate?: string;

  /**
  * 声道数
  */
  channels?: number;

  /**
  * 声道布局
  */
  channelLayout?: string;

  /**
  * 码率
  */
  bitRate?: number;

  /**
  * 字幕语言
  */
  language?: string;

  /**
  * 字幕标题
  */
  title?: string;

  disposition?: { [key:string]:string }

  /**
  * 其他标签
  */
  tags?: { [key:string]:string }
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
 * 视频转码表单属性
 */
export interface EncodeConvertFormData {
  /** 各流的转换规则。key - 输入流index */
  convertRules: { [index:string]: EncodeConvertRule}

  /** 用作输入的流。key - 输入流index */
  mapStreams: { [index:string]: boolean }

  /** 实际使用的流的转换规则 */
  enabledConvertRules: EncodeConvertRule[],

  /** 质量因子 */
  crf: string

  /** 封装格式 */
  format: string

  /** 输出文件名 */
  fileName: string

  /** 输出文件所在目录 */
  savePath: string

  /**
   * 批量转码时，文件保存路径策略
   * 
   * - `same`: 转码后的文件与原文件使用相同的目录
   * - `fixed`: 所有转码后的文件统一放到固定目录下
   * - `relative`: 转码后的文件放到相对于原文件的指定目录下
   */
  pathStrategy?: 'same' | 'fixed' | 'relative'


  /** 视频编码的质量与速度预设 */
  preset?: EncodePreset
  
  /** 视频编码优化调优参数。针对特定类型的视频内容进行编码优化(H.264/H.265)，以获得更好的压缩效率或视觉质量。 */
  tune?: EncodeTune

  /** 新文件存在同名时，是否覆盖 */
  isOverwrite?: boolean
}

export type EncodeTune = 'animation' | 'film' | 'grain' | 'stillimage' | 'zerolatency' | 'fastdecode'
export type EncodePreset = 'ultrafast' | 'superfast' | 'veryfast' | 'faster' | 'fast' | 'medium' | 'slow' | 'slower' | 'veryslow' | 'placebo'

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
  /** 质量因子，通常18~23，该值越大画质越差，文件越小。 */
  crf?: string
  /** 视频编码的质量与速度预设 */
  preset?: EncodePreset
  /** 视频编码优化调优参数。针对特定类型的视频内容进行编码优化(H.264/H.265)，以获得更好的压缩效率或视觉质量。 */
  tune?: EncodeTune
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

/**
 * 编码规则参数
 */
export interface EncodeConvertParam {
  /**
   * 各个流的编码转换规则
   */
  rules: EncodeConvertRule[]

  /**
   * 容器封装格式
   */
  format?: string
}

/**
 * 转码任务参数
 */
export interface EncodeConvertTaskParam {
  /**
   * 待转码的源文件
   */
  source: ResourceRequest

  /**
   * 转码后的目标文件
   */
  target: ResourceRequest

  /**
   * 转码参数
   */
  encodeConvertParam: EncodeConvertParam
  
  /** 新文件存在同名时，是否覆盖 */
  isOverwrite?: boolean
}

export interface EncodeConvertTask {
  id: string
  uid: IdType
  createAt: string
  updateAt: string
  type: 'audio' | 'video' | 'format'
  params: string
  progress?: CommonProgress
  asyncTaskRecord: AsyncTaskRecord
}