const server = {
    //  webpack-dev-server反代的目标服务器
    proxyServer: 'http://127.0.0.1:8087',

    /**
     * 获取服务器地址，当服务器地址为空时，返回当前页面地址
     */
    getServer() {
        return this.server || location.origin
    },
    //  请求的服务器地址（不需要加/api），留空则表示后端与前端地址相同（将此项目编译后与后端一起打包，或者使用了反向代理）
    server: ''
}

module.exports = server
