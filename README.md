# 基于Vue和MDUI的咸鱼云网盘-前端
![](https://img.shields.io/badge/Vue-2.5.2-green.svg)
![](https://img.shields.io/badge/Mdui-1.0.1-blue.svg)
![](https://img.shields.io/badge/less-3.13.0-orange.svg)
![](https://img.shields.io/badge/axios-0.21.0-blue.svg)
## 提示 
- 该项目仅为前端，不带后端，后端项目请移步[这里](https://gitee.com/xiaotao233/saltedfishcloud-backend)

- 开发服务器使用了反向代理，因为是前后端分离项目懒得搞跨域了（突然想起来后端没弄跨域，暂时不管啦23333，有空再改）。反向代理配置位置`config/index.js`中的`dev.proxyTable`

## 项目介绍
### 简介
咸鱼云网盘目前是一个用于共享文件和实现私人网盘基本功能的系统，目前仍处于原型开发阶段，许多功能和文档尚未完善。  

## 快速开始  
### 设置咸鱼云网盘后端地址
- 在`/src/api/apiConfig.js`中可配置项目请求的后端API服务器地址和webpack-dev-server反代服务器地址
- 服务器后端API在`/src/api/apiConfig.js`中集中管理，调用方法或属性直接返回请求API的axios配置
- 咸鱼云后端API接口URL前缀均为/api
### 构建项目

``` bash
# 安装依赖（国内可使用cnpm代替npm）
npm install

# 启动开发服务器（默认使用http://127.0.0.1:8080  注意不是localhost）用于开发调试
npm run dev

# 构建生产版本（构建完毕后，项目静态文件在/dist，将里面的文件部署到web服务器即可）
npm run build
```