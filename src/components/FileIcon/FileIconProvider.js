/**
 * @typedef {Object} IconRule
 * @property {Array<String>} accept 接受的文件类型
 * @property {String} iconName 图标文件名称（不带后缀名）
 * @property {String} descript 规则描述
 * @property {String=} suffix  图标文件后缀名，可选
 */

/**
 * 图标规则映射数组
 * @type {Array<IconRule>}
 */
const mapper = [
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
        iconName: 'apk',
        descript: '安卓安装包'
    }
]

const selectConfig = {
    /**
     * 图标资源映射规则
     */
    mapper: mapper,
    /**
     * 默认的资源后缀名
     */
    defaultSuffix: 'png',
    /**
     * 图标文件资源加载器
     */
    loader: {
        load(resourcName) {
            return require('@/assets/img/icon/' + resourcName)
        }
    },
    /**
     * 加载未定义的文件类型图标加载器
     */
    unknowFileLoader: {
        load() {
            return require('@/assets/img/icon/file.png')
        }
    },
    /**
     * 目录图标文件类型加载器
     */
    dirLoader: {
        load() {
            return require('@/assets/img/icon/dir.png')
        }
    }
}

/**
 * 缓存文件类型与规则对象的映射关系
 * @type {Map<String, IconRule>}
 */
const cacheMap = new Map()
mapper.forEach(item => {
    item.accept.forEach(type => {
        cacheMap.set(type, item)
    })
})
const provider = {
    cacheMap: cacheMap,
    /**
     * 文件图标资源选择配置
     */
    config: selectConfig,
    /**
     * 获取文件图标资源（不包括缩略图）。
     * 执行流程：
     * 1. 优先判断是否为目录，目录直接调用目录资源加载器加载目录图标
     * 2. 从config.mapper中获取相匹配的规则对象
     * 3. 调用加载器获取资源
     * @param {String} type     文件类型（即拓展名）
     * @param {Boolean} isDir   是否为目录
     * @returns {String} 可用于img标签src属性的值
     */
    getIconResource(type, isDir) {
        if (isDir) {
            return this.config.dirLoader.load()
        }
        const resourceDefObj = this.cacheMap.get(type)
        if (!resourceDefObj) {
            // 找不到匹配的图标资源定义对象，使用默认图标
            return this.config.unknowFileLoader.load()
        }
        const resourceName = resourceDefObj.iconName + '.' + (resourceDefObj.suffix || this.config.defaultSuffix)
        return this.config.loader.load(resourceName)
    }
}

export default provider
