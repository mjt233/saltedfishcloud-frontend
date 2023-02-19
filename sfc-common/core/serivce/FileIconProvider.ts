import dirIcon from 'sfc-common/assets/img/icon/dir.png'
import defaultFileIcon from 'sfc-common/assets/img/icon/file.png'

export interface IconRule {
  // 接受的文件类型
  accept: string[],

  // 图标文件名称（不带后缀名）
  iconName: string,

  // 规则描述
  descript: string,

  // 图标文件后缀名，可选
  suffix?: string
}

/**
 * 图标规则映射数组
 * @type {Array<IconRule>}
 */
const mapper: IconRule[] = [
  {
    accept: ['zip', 'rar', 'gz', '7z', 'tar', 'xz'],
    iconName: 'zipped',
    descript: '压缩文件'
  },
  {
    accept: ['mp4', 'mkv', 'flv', 'avi', 'wmv', 'mov'],
    iconName: 'video',
    descript: '视频文件'
  },
  {
    accept: ['mp3', 'wav', 'm4a', 'flac', 'ape'],
    iconName: 'audio',
    descript: '音频文件'
  },
  {
    accept: ['jpeg', 'jpg', 'gif', 'png', 'bmp', 'icon'],
    iconName: 'picture',
    descript: '图像文件'
  },
  {
    accept: ['ppt', 'pptx'],
    iconName: 'ppt',
    descript: 'PPT幻灯片文件'
  },
  {
    accept: ['doc', 'docx'],
    iconName: 'doc',
    descript: 'DOC文档文件'
  },
  {
    accept: ['xls', 'xlsx'],
    iconName: 'excel',
    descript: 'excel表格文件'
  },
  {
    accept: ['txt'],
    iconName: 'txt',
    descript: '纯文本文件'
  },
  {
    accept: ['exe'],
    iconName: 'exe',
    descript: 'Windows可执行文件'
  },
  {
    accept: ['iso'],
    iconName: 'iso',
    descript: 'iso镜像文件'
  },
  {
    accept: ['image', 'dmg'],
    iconName: 'img',
    descript: '系统镜像文件'
  },
  {
    accept: ['html', 'htm'],
    iconName: 'code',
    descript: 'html代码文件'
  },
  {
    accept: ['ini', 'conf', 'cnf'],
    iconName: 'config',
    descript: '配置文件'
  },
  {
    accept: ['apk'],
    iconName: 'android',
    descript: '安卓安装包'
  },
  {
    accept: ['md'],
    iconName: 'md',
    descript: 'markdown'
  },
  {
    accept: ['java'],
    iconName: 'java',
    descript: 'java源代码文件'
  },
  {
    accept: ['class'],
    iconName: 'class',
    descript: 'class文件'
  },
  {
    accept: ['js'],
    iconName: 'js',
    descript: 'JavaScript'
  },
  {
    accept: ['xml'],
    iconName: 'xml',
    descript: 'xml'
  },
  {
    accept: ['license'],
    iconName: 'license',
    descript: 'license'
  },
  {
    accept: ['gitignore'],
    iconName: 'git',
    descript: 'git'
  },
  {
    accept: ['yml'],
    iconName: 'yml',
    descript: 'yml'
  },
  {
    accept: ['yaml'],
    iconName: 'yaml',
    descript: 'yaml'
  },
  {
    accept: ['cmd', 'bat', 'sh', 'bash'],
    iconName: 'shell',
    descript: 'shell脚本'
  },
  {
    accept: ['json'],
    iconName: 'json',
    descript: 'json'
  },
  {
    accept: ['pdf'],
    iconName: 'pdf',
    descript: 'pdf'
  },
  {
    accept: ['chm'],
    iconName: 'chm',
    descript: 'chm'
  }
]

export interface IconSelectConfig {
  mapperRule: IconRule[],

  defaultSuffix: string
}

export interface IconLoader {

  /**
   * 文件图标URL
   * @param name 文件名
   * @param md5 文件md5
   */
  load(name: string, md5?: string): string
}

export interface FileIconProvider {
  /**
   * 文件图标URL
   * @param name 文件名
   * @param md5 文件md5
   */
  getFileIconUrl(name: string, md5?: string): string

  /**
   * 文件夹图标URL
   * @param name 文件夹名称
   */
  getDirIconUrl(name: string): string

  /**
   * 追加合并图标规则
   * @param rules 图标规则
   */
  mergeRule(...rules: IconRule[]): void
}

class DefaultIconProvider implements FileIconProvider {
  private cacheMap: Map<string, IconRule> = new Map
  private config: IconSelectConfig
  constructor(config: IconSelectConfig) {
    this.mergeRule(...config.mapperRule)
    this.config = config
  }
  public getFileIconUrl(name: string, md5?: string): string {
    const suffix = name.split('.').pop() || ''
    const ruleObj = this.cacheMap.get(suffix.toLowerCase())
    if (!ruleObj) {
      return defaultFileIcon
    } else {
      return new URL(`/sfc-common/assets/img/icon/${ruleObj.iconName}.${ruleObj.suffix || this.config.defaultSuffix}`, import.meta.url).href
    }
    
  }
  public getDirIconUrl(name: string): string {
    return dirIcon
  }
  public mergeRule(...rules: IconRule[]): void {
    rules.forEach(rule => {
      rule.accept.forEach(acceptSuffix => {
        this.cacheMap.set(acceptSuffix.toLowerCase(), rule)
      })
    })
  }
  
}

const iconProvider = new DefaultIconProvider({
  defaultSuffix: 'png',
  mapperRule: mapper
})

export default iconProvider