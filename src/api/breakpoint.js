const breakpoint = {
    /**
     * 创建断点续传任务
     * @param {String} name 文件名
     * @param {Number} size 文件大小
     * @returns {import("axios").AxiosRequestConfig}
     */
    createTask(name, size) {
        let chunkSize = 2097152
        if (size > 1024 * 1024 * 16) {
            chunkSize *= 2
        } else if (chunkSize > 1024 * 1024 * 128) {
            chunkSize *= 8
        }
        return {
            url: 'breakpoint',
            method: 'post',
            data: {
                fileName: name,
                length: size,
                chunkSize: chunkSize
            }
        }
    },
    /**
     * 上传文件块到断点续传任务中
     * @param {String} id 断点续传任务ID
     * @param {File} file 文件
     * @param {String} part 本次上传的文件编号，支持范围表示，如：3-6 表示本次上传的文件块按顺序包含编号3,4,5,6的部分
     * @returns {import("axios").AxiosRequestConfig}
     */
    uploadPart(id, file, part) {
        const fd = new FormData()
        fd.append('file', file)
        return {
            url: `breakpoint/${id}/${part}`,
            method: 'post',
            data: fd
        }
    }
}

module.exports = breakpoint
