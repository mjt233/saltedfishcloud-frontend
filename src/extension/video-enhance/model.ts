export interface MediaStream {
  /**
   * 流编号
   */
  no: string

  /**
   * 备注
   */
  remark: string

  /**
   * 流类型
   */
  type: string

  /**
   * 元数据
   */
  metadata: Map<string,string>

  /**
   * 码率（byte per second）
   */
  bps: Number

  /**
   * 持续时长
   */
  duration: string

  /**
   * 原始行文本
   */
  originLine: string
}

export interface AudioStream extends MediaStream {
  /**
   * 编码
   */
  encode: string

  /**
   * 采样率
   */
  sampleRate: Number

  /**
   * 模式（单声道/双声道）
   */
  mode: string
}

export interface VideoStream extends MediaStream {
  
  /**
   * 编码
   */
  encode: string

  /**
   * 分辨率，如：1920x1080
   */
  resolution: string

  /**
   * 帧率(fps)
   */
  frameRage: Number
}

export interface SubtitleStream extends MediaStream {
  /**
   * 标题
   */
  title: string
}

/**
 * 视频章节时间点
 */
export interface Chapter {
  /**
   * 开始时间，如：0、00:21:23.3333
   */
  start: string

  /**
   * 结束时间
   */
  end: string

  /**
   * 标题
   */
  title: string

  /**
   * 编号
   */
  no: string
}

export interface VideoInfo {
  audioStreamList: AudioStream[]
  chapterList: Chapter[]
  otherStreamList: MediaStream[]
  subtitleStreamList: SubtitleStream[]
  videoStreamList: VideoStream[]
}