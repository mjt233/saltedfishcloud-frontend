export namespace Upnp {
    /**
   * Upnp 设备信息
   */
  export interface UpnpDevice {
    /**
     * 发现/刷新上线时间
     */
    foundAt: number;

    /**
     * 缓存过期的时间
     */
    expireAt: number;

    /**
     * 缓存保留时长（秒）
     */
    cacheControlMaxAge: number;

    /**
     * 描述 URL
     */
    location: string;

    /**
     * 描述信息
     */
    describe: UpnpDescribe;
  }

  /**
   * UPnP 设备描述文档根元素
   * 
   * 对应 XML 中的 `<root>` 元素，包含设备的完整描述信息
   * 命名空间: urn:schemas-upnp-org:device-1-0
   */
  export interface UpnpDescribe {
    /**
     * 原始 XML
     */
    rawXML: string;

    /**
     * UPnP 协议版本信息
     * 
     * 对应 `<specVersion>` 元素，描述设备遵循的 UPnP 协议版本
     */
    specVersion: SpecVersion;

    /**
     * 设备描述信息
     * 
     * 对应 `<device>` 元素，包含设备的所有详细信息和嵌套设备结构
     */
    device: Device;
  }

  /**
   * UPnP 协议版本规格
   * 
   * 定义设备支持的 UPnP 协议主要和次要版本号
   */
  export interface SpecVersion {
    /**
     * 主版本号
     * 
     * 对应 `<major>` 元素，通常为 1
     */
    major: number;

    /**
     * 次版本号
     * 
     * 对应 `<minor>` 元素，通常为 0 或 1
     */
    minor: number;
  }

  /**
   * UPnP 设备实体
   * 
   * 描述一个 UPnP 设备的所有属性和能力
   */
  export interface Device {
    /**
     * 设备类型标识符
     * 
     * 对应 `<deviceType>` 元素，URN 格式的设备类型定义
     * 例如: "urn:schemas-upnp-org:device:MediaRenderer:1"
     */
    deviceType: string;

    /**
     * 设备友好名称
     * 
     * 对应 `<friendlyName>` 元素，用户可读的设备显示名称
     * 例如: "客厅电视"、"卧室音响" 等
     */
    friendlyName: string;

    /**
     * 设备型号名称
     * 
     * 对应 `<modelName>` 元素，设备的型号名称
     * 例如: "Windows Digital Media Renderer"、"TV-X1000" 等
     */
    modelName: string;

    
    /**
     * 设备型号编号
     */
    moduleNumber?: string

    /**
     * 设备型号页面
     */
    modelURL?: string;

    /**
     * 唯一设备名称 (Universal Device Name)
     * 
     * 对应 `<UDN>` 元素，设备的全局唯一标识符
     * 格式: "uuid:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
     */
    udn: string;

    /**
     * 设备图标列表
     * 
     * 对应 `<iconList>` 包装元素，包含多个 `<icon>` 元素
     * 用于在不同界面展示设备图标，支持多种尺寸和格式
     */
    iconList?: Icon[];

    /**
     * 设备服务列表
     * 
     * 对应 `<serviceList>` 包装元素，包含多个 `<service>` 元素
     * 描述设备提供的 UPnP 服务，如 AVTransport、RenderingControl 等
     */
    serviceList: Service[];

    /**
     * 嵌套设备列表
     * 
     * 对应 `<deviceList>` 包装元素，包含多个嵌套的 `<device>` 元素
     * 用于描述复合设备中的子设备，支持递归结构
     * 例如: 路由器包含 WAN 设备，WAN 设备包含 WAN 连接设备
     */
    deviceList?: Device[];

    /**
     * 设备制造商名称
     * 
     * 对应 `<manufacturer>` 元素，设备的生产厂商
     * 例如: "Microsoft Corporation"、"TP-LINK" 等
     */
    manufacturer: string;

    /**
     * 制造商官方网站 URL
     * 
     * 对应 `<manufacturerURL>` 元素，制造商的官方网站地址
     */
    manufacturerURL: string;

    /**
     * 设备型号描述
     * 
     * 对应 `<modelDescription>` 元素，设备的详细描述信息
     * 例如: "Digital Media Renderer"、"Wireless Router" 等
     */
    modelDescription: string;

    /**
     * 设备型号编号
     * 
     * 对应 `<modelNumber>` 元素，设备的型号版本号
     * 例如: "1.0"、"7.0" 等
     */
    modelNumber: string;

    /**
     * 设备管理页面 URL
     * 
     * 对应 `<presentationURL>` 元素，设备 Web 管理界面的访问地址
     * 通常用于路由器的配置页面
     */
    presentationURL: string;
  }

  /**
   * 设备图标信息
   * 
   * 描述设备图标的属性，支持多种格式和尺寸
   */
  export interface Icon {
    /**
     * 图标 MIME 类型
     * 
     * 对应 `<mimetype>` 元素，图标的媒体类型
     * 例如: "image/jpeg"、"image/png"
     */
    mimetype: string;

    /**
     * 图标宽度（像素）
     * 
     * 对应 `<width>` 元素，图标的水平像素数
     * 常见值: 48, 120, 256 等
     */
    width: number;

    /**
     * 图标高度（像素）
     * 
     * 对应 `<height>` 元素，图标的垂直像素数
     * 常见值: 48, 120, 256 等
     */
    height: number;

    /**
     * 图标颜色深度（位）
     * 
     * 对应 `<depth>` 元素，每个像素的颜色位数
     * 常见值: 24 (真彩色), 32 (带透明度) 等
     */
    depth: number;

    /**
     * 图标资源 URL
     * 
     * 对应 `<url>` 元素，图标文件的访问地址
     * 相对路径或绝对 URL，可从设备获取图标文件
     */
    url: string;
  }

  /**
   * UPnP 服务描述
   * 
   * 描述设备提供的一个具体 UPnP 服务
   */
  export interface Service {

    /**
     * 服务类型标识符
     * 
     * 对应 `<serviceType>` 元素，URN 格式的服务类型定义
     * 例如: "urn:schemas-upnp-org:service:AVTransport:1"
     */
    serviceType: string;

    /**
     * 服务标识符
     * 
     * 对应 `<serviceId>` 元素，服务的唯一标识符
     * 格式: "urn:upnp-org:serviceId:服务名称"
     */
    serviceId: string;

    /**
     * 服务控制 URL
     * 
     * 对应 `<controlURL>` 元素，用于发送 SOAP 控制命令的地址
     * 客户端通过此 URL 调用服务的各种操作
     */
    controlURL: string;

    /**
     * 事件订阅 URL
     * 
     * 对应 `<eventSubURL>` 元素，用于订阅服务状态变化的地址
     * 客户端通过此 URL 注册接收服务状态更新通知
     */
    eventSubURL?: string;
  }

  /**
   * SCPD (Service Control Protocol Definition) 实体类
   * 用于反序列化UPnP服务描述XML
   * 对应SCPD XML文档的根元素
   */
  export interface Scpd {
    /**
     * 协议版本信息
     */
    specVersion?: SpecVersion

    /**
     * 动作列表，包含该服务支持的所有操作
     */
    actionList: Action[]

    /**
     * 服务状态表，包含该服务的所有状态变量定义
     */
    serviceStateTable: StateVariable[]
  }

  /**
   * 允许值范围类
   * 定义数值类型状态变量的取值范围
   */
  export interface AllowedValueRange {
    /**
     * 最小值
     */
    minimum?: number

    /**
     * 最大值
     */
    maximum?: number

    /**
     * 步长
     */
    step?: number
  }

  export interface Action {
    /**
     * 动作名称
     */
    name: string

    /**
     * 参数列表，包含该动作的所有输入输出参数
     */
    argumentList: Argument[]
  }

  export interface Argument {
    /**
     * 参数名称
     */
    name: string

    /**
     * 参数方向：in(输入) 或 out(输出)
     */
    direction: 'in' | 'out'

    /**
     * 相关的状态变量名称
     */
    relatedStateVariable: string

    /**
     * 相关的状态变量具体定义对象信息
     */
    variableRef?: StateVariable
  }

  export interface StateVariable {
    /**
     * 事件发送标志：yes(发送事件) 或 no(不发送事件)
     */
    sendEvents?: string

    /**
     * 状态变量名称
     */
    name: string

    /**
     * 数据类型
     * 如：string, ui4, i4 等
     */
    dataType: 'string' | 'ui4' | 'i4' | 'boolean'

    /**
     * 允许值列表
     * 定义该状态变量允许的枚举值
     */
    allowedValueList?: string[]

    /**
     * 允许值范围
     * 定义数值类型状态变量的取值范围
     */
    allowedValueRange?: AllowedValueRange

    /**
     * 默认值
     */
    defaultValue?: string
  }


  /**
   * UPnP服务调用参数
   */
  export interface ServiceActionInvokeParam {
    /**
     * 根设备的 UDN/USN
     */
    rootDeviceUSN: string

    /**
     * 服务类型
     */
    serviceType: string

    /**
     * 要调用的动作 action
     */
    action: string

    /**
     * 调用请求参数
     */
    actionParams: {
      key: string
      value: string
    }[]
  }

  export interface SimpleHttpResponse {
    /**
     * 响应码
     */
    statusCode: number

    /**
     * 响应头
     */
    headers: {
      key: string
      value: string
    }[]

    /**
     * 响应体
     */
    responseBody: string
  }
}