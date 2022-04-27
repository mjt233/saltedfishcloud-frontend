/**
 * 全局常量或其他动态属性
 */
const GlobalAttr = {
    /**
     * 系统支持的特性标记
     */
    feature: {},
    /**
     * 图像类型
     */
    imageType: { jpg: true, jpeg: true, gif: true, bmp: true, png: true, webp: true, ico: true, icon: true },
    /**
     * 是否为图像类型文件名
     * @param {String} name 文件名
     */
    isImage(name) {
        const type = name.split('.').pop().toLowerCase()
        return this.imageType[type]
    }
}

export default GlobalAttr
