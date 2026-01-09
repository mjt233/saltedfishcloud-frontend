import { MethodInterceptor } from 'sfc-common'
import { Subtitle } from '../model'
import libpgsWorkerUrl from 'libpgs/dist/libpgs.worker?url'
import type { PgsRenderer } from 'libpgs'

export interface SubtitleRender {
  /**
   * 初始化字幕渲染器
   * @param video 要附靠的video元素
   * @returns 字幕容器元素
   */
  init(video: HTMLVideoElement): Promise<HTMLElement>

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
  private container: HTMLElement
  /**
   * ASS实例
   */
  private assInst: any
  private fontSizeResizer: any
  private resizeFunc = MethodInterceptor.createThrottleProxyFunc(() => {
    if (this.assInst) {
      this.assInst.resize()
    }
  }, { delay: 200, afterExecute: true })
  
  constructor(subtitle: Subtitle) {
    this.subtitle = subtitle
    this.container = document.createElement('div')
  }

  async init(video: HTMLVideoElement): Promise<HTMLElement> {
    // 销毁旧实例
    this.destroy()

    // 动态导入assjs模块(虽然打出来的umd js文件已经包含了ass了，方便后续改成了esm)
    const ASS = (await import('assjs')).default

    // 获取ASS字幕内容
    const assContent = (await window.SfcUtils.request({ url: this.subtitle.url})).data

    // 初始化ASS实例
    this.container = document.createElement('div')
    this.assInst = new ASS(assContent, video, {
      container: this.container,
      resampling: 'video_width'
    })
    const forceFontSize = '21px'

    // 强制设置字幕字体大小
    const stage = this.container.querySelector('.ASS-stage')
    if (stage) {
      if(stage.getAttribute('has-hock-append-child') != '1') {
        stage.setAttribute('has-hock-append-child', '1')
        // 拦截dom的append操作，对每个新添加的字幕强制重置字体大小
        const originAppendChild = stage.appendChild.bind(stage)
        stage.appendChild = dom => {
          if (dom instanceof HTMLElement) {
            const textDom = dom.querySelector('span')
            if (textDom) {
              textDom.style.fontSize = forceFontSize
            }
          }
          return originAppendChild(dom)
        }
      }
    }
    this.fontSizeResizer = setInterval(() => {
      stage?.querySelectorAll('.ASS-stage span').forEach(textDom => (textDom as HTMLSpanElement).style.fontSize = forceFontSize)
    }, 500)
    window.addEventListener('resize', this.resizeFunc)
    return this.container
  }

  destroy(): void {
    if (this.fontSizeResizer) {
      clearInterval(this.fontSizeResizer)
      this.fontSizeResizer = null
    }
    if (this.assInst) {
      this.assInst.destroy()
    }
    window.removeEventListener('resize', this.resizeFunc)
  }

  getSubtitle(): Subtitle {
    return this.subtitle
  }
  
  getContainer(): HTMLElement {
    return this.container
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