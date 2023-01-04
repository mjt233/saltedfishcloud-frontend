import { ChildrenType } from '@/utils/SfcUtils/common/DyncMount'
import { App } from 'vue'
/**
 * 下拉选择选项
 */
export interface SelectOption {
  title: string,
  value: any,
  action?: () => any
}

/**
 * 通用模型
 */
export interface AuditModel {
  id: IdType

  uid: IdType

  updateAt: string

  createAt: string
}

/**
 * 通用统一资源请求参数
 */
export interface ResourceRequest {
  /** 请求的资源所在路径 */
  path: string

  /** 资源文件名 */
  name: string

  /** 目标资源id，如公共网盘/私人网盘则使用用户id，文件分享使用分享id等，取决于具体文件协议提供者 */
  targetId: IdType

  /** 请求的资源协议，公共网盘/私人网盘使用main，文件分享使用share等，取决于具体文件协议提供者 */
  protocol: string

  /** 是否为缩略图资源请求 */
  isThumbnail?: boolean

  /** 其他自定义附加参数 */
  [key:string]:any
}


/**
 * 数据ID类型
 */
export type IdType = number | string

/**
 * 配置节点类型
 */
export type ConfigNodeInputType = 'switch' | 'select' | 'multi-select' | 'ratio' | 'checkbox' | 'text' | 'form' | 'template'

/**
 * 基本原始数据类型
 */
export type RawType = number | string | boolean

/**
 * 属性配置节点
 */
export interface ConfigNodeModel {
  /* 节点名 */
  name: string

  /* 配置标题 */
  title: string

  /* 节点值 */
  value: any

  /* 是否使用掩码*显示 */
  mask?: boolean

  /* 默认值 */
  defaultValue: RawType

  /* 原值（被修改前） */
  originValue: RawType

  hide?: boolean

  /* 描述 */
  describe?: string

  readonly?: boolean

  disabled?: boolean

  /* 数据编辑输入方式 */
  inputType: ConfigNodeInputType

  /* 可选项，用于为select、multi-select、ratio和checkbox类型提供可选值 */
  options?: SelectOption[]

  /* 子节点，用于为form表单类型提供子表单数据，子表单的值为json格式化字符串 */
  nodes?: ConfigNodeModel[]

  /* 图标 */
  icon?: string

  /* 当类型为template时使用模板内容作为内容编辑 */
  template?: string | ChildrenType

  /* 是否必填 */
  required?: boolean
}

/**
 * 拓展插件基本信息
 */
export interface PluginConfigNodeInfo {
  /* 插件名称 */
  name: string

  /* 插件别名 */
  alias: string

  /* 插件图标 */
  icon: string

  /* 插件版本 */
  version: string

  /* 该插件下的配置组 */
  groups: ConfigNodeModel[]
}



/**
 * 拓展插件基本信息
 */
export interface PluginInfo {
  /* 插件名称 */
  name: string

  /* 插件别名 */
  alias: string

  /* 插件图标 */
  icon: string

  /* 加载类型 */
  loadType: 'MERGE'

  /* 插件描述 */
  describe: string

  /* 插件作者 */
  author: string

  /* 作者邮箱 */
  email: string

  /* 插件版本 */
  version: string

  /* 插件构建时使用的咸鱼云API版本 */
  apiVersion: string
  
  /* 该插件内需要自动加载的资源列表 */
  autoLoad: string[]
}

export interface NameValueType<T = any> {
  name: string,
  value: T
}

/**
 * 启动流程任务处理器，用于在挂载Vue实例前进行各项前置任务的处理
 */
export interface BootProcessor {
  /**
   * 执行启动流程任务
   * @param app Vue App实例
   * @param handler 启动上下文操作器
   */
  execute?: (app: App<Element>, handler: BootContextHandler) => Promise<any> | void

  /**
   * 任务名称
   */
  taskName: string

  /**
   * 启动完成时执行操作
   */
  onFinish?: (app: App<Element>, handler: BootContextHandler) => void

  [other: string]: any
}

/**
 * 前端项目加载启动流程上下文
 */
export interface BootContext {
  /**
   * 添加一个执行器到启动流程中，若流程进行中添加，也依然会对添加的执行器进行调用。
   * 若启动流程已执行完成，则不会再被调用了
   * @param executor 执行器
   */
  addProcessor(executor: BootProcessor): BootContext

  /**
   * 开始执行启动流程
   */
  start(): Promise<any>
}

/**
 * 启动流程上下文操作器，用于调整启动流程中的各项数据
 */
export interface BootContextHandler {
  /**
   * 设置当前启动任务的标题
   * @param title 标题
   */
  setBootTaskTitle(title: string): void

  /**
   * 输出错误级别启动消息
   * @param msg 消息
   */
   logError(msg: string): void

   /**
    * 输出警告级别启动消息
    * @param msg 消息
    */
   logWarning(msg: string): void

  /**
   * 输出INFO级别启动消息
   * @param msg 消息
   */
  logInfo(msg: string): void

  /**
   * 更新启动进度
   * @param max 目标进度
   * @param value 当前进度
   */
  updateProgress(max: number, value: number): void

  /**
   * 设置流程中断消息
   * @param msg 消息
   */
  setInterruptMsg(msg: string): void
}

export interface FileSystemStatus {
    /** 存储域 */
    area: 'public' | 'private',

    /** 目录数量 */
    dirCount: string,

    /** 文件数量 */
    fileCount: string,

    /** 剩余空间（byte） */
    free: string,

    /** 资源存储路径 */
    path: string,

    /** 咸鱼云系统网盘文件占用大小 */
    sysUsed: string,

    /** 存储系统空间总量大小 */
    total: string,
    
    /** 存储系统已用空间大小 */
    used: string,

    /** 其他参数 */
    otherAttributes?: ConfigNodeModel[]
}

export interface SystemOverview {
  /** 文件系统状态 */
  fileSystemStatus: FileSystemStatus[],
  /** 系统其他状态 */
  systemStatus: ConfigNodeModel[]
}

export interface CommonProgress {
  /** 已完成的量 */
  loaded: number

  /** 总共需要完成的量 */
  total: number

  /** 上次更新时间（Unix时间戳） */
  lastUpdateTime: number

  /** 每秒钟完成的量 */
  speed: number
}