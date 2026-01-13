import { Subtitle } from '../model'
import libpgsWorkerUrl from 'libpgs/dist/libpgs.worker?url'
import libassWorkerUrl from 'libass-wasm/dist/js/subtitles-octopus-worker?url'
import libassLegacyWorkerUrl from 'libass-wasm/dist/js/subtitles-octopus-worker-legacy?url'
import type { PgsRenderer } from 'libpgs'

export interface SubtitleRender {
  /**
   * 初始化字幕渲染器
   * @param video 要附靠的video元素
   * @returns 字幕容器元素
   */
  init(video: HTMLVideoElement): Promise<HTMLElement | null>

  /**
   * 销毁字幕渲染器实例
   */
  destroy(): void

  /**
   * 获取当前字幕对象
   */
  getSubtitle(): Subtitle

  /**
   * 获取字幕容器元素。只有当字幕渲染器已初始化时才返回容器元素。
   */
  getContainer(): HTMLElement | null
}

export class SupSubtitleRender implements SubtitleRender {
  private subtitle: Subtitle
  private container?: HTMLCanvasElement
  private pgsRenderer?: PgsRenderer

  constructor(subtitle: Subtitle) {
    this.subtitle = subtitle
  }
  async init(video: HTMLVideoElement): Promise<HTMLElement> {
    const libpgs = await import('libpgs')
    
    const canvas = document.createElement('canvas')
    this.container = canvas
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const render = new libpgs.PgsRenderer({
      video,
      subUrl: this.subtitle.url,
      workerUrl: libpgsWorkerUrl,
      canvas: canvas,
      aspectRatio: 'contain'
    })
    this.pgsRenderer = render
    return this.container
  }

  destroy(): void {
    if (this.pgsRenderer) {
      this.pgsRenderer.dispose()
    }
  }

  getSubtitle(): Subtitle {
    return this.subtitle
  }

  getContainer(): HTMLElement | null {
    return this.container || null
  }
}

/**
 * ASS字幕渲染器实现
 */
export class AssSubtitleRender implements SubtitleRender {
  private subtitle: Subtitle
  /**
   * ASS实例
   */
  private assInst: any
  
  constructor(subtitle: Subtitle) {
    this.subtitle = subtitle
  }

  async init(video: HTMLVideoElement): Promise<HTMLElement | null> {
    // 销毁旧实例
    this.destroy()

    // 动态导入 libass-wasm 模块(虽然打出来的umd js文件已经包含了 libass-wasm 了，方便后续改成了esm)
    const SubtitlesOctopus = (await import('libass-wasm')).default

    // 初始化ASS实例
    const assContent = (await window.SfcUtils.request({ url: this.subtitle.url})).data
    this.assInst = new SubtitlesOctopus({
      subContent: assContent,
      video: video,
      workerUrl: libassWorkerUrl,
      legacyWorkerUrl: libassLegacyWorkerUrl,
      fallbackFont: window.SfcUtils.getApiUrl(window.API.plugin.getPluginResource('video-enhance', 'SourceHanSansSC-Regular-2.otf'))
    })
    return null
  }

  destroy(): void {
    if (this.assInst) {
      this.assInst.dispose()
    }
  }

  getSubtitle(): Subtitle {
    return this.subtitle
  }
  
  getContainer(): HTMLElement | null {
    return null
  }
}

/**
 * 创建字幕渲染器实例
 * @param subtitle 待渲染的字幕
 * @returns 字幕渲染器实例
 */
export function createSubtitleRender(subtitle: Subtitle): SubtitleRender | null {
  if (subtitle.type === 'ass') {
    return new AssSubtitleRender(subtitle)
  } else if (subtitle.type === 'sup') {
    return new SupSubtitleRender(subtitle)
  }
  return null
}