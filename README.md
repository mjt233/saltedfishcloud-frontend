# 基于Vue和MDUI的咸鱼云网盘-前端
![](https://img.shields.io/badge/Vue-2.5.2-green.svg)
![](https://img.shields.io/badge/Mdui-1.0.1-blue.svg)
![](https://img.shields.io/badge/less-3.13.0-orange.svg)
![](https://img.shields.io/badge/axios-0.21.0-blue.svg)

## 简介
咸鱼云网盘目前是一个用于共享文件和实现私人网盘基本功能的系统，目前仍处于初期开发阶段，许多功能和文档尚未完善。  

## 杂杂念
该项目目前仅由我个人（学生）进行维护，是我从无基础（经验）一边学习一边开发一边重构和维护的项目，难免会有明显bug或明显的设计缺陷，对项目有任何疑问或建议，欢迎各路大佬评论或提出issue。

如果你对我这个玩具项目感兴趣，也想参与项目开发，可以fork该项目，发起Pull Request，审核和测试通过后将合并你的代码。

如果长时间未得到我的回复，可能是我刚好比较忙或忘了回复，可以试着给我发邮件。

## 提示 
- 该项目仅为前端，不带后端，后端项目请移步[这里](https://gitee.com/xiaotao233/saltedfishcloud-backend)

- 开发服务器使用了反向代理，因为是前后端分离项目懒得搞跨域了（突然想起来后端没弄跨域，暂时不管啦23333，有空再改）。反向代理配置位置`config/index.js`中的`dev.proxyTable`


## 快速开始  
1. 设置咸鱼云网盘后端地址

    - 修改`/src/api/API.js`以配置项目请求的后端API服务器地址和webpack-dev-server反代服务器地址  
        配置示例
        ```JavaScript
        const API = {
            //  webpack-dev-server反代的目标服务器，仅开发用
            proxyServer: 'http://127.0.0.1:8087',

            //  请求的服务器地址（不需要加/api），留空则表示后端与前端地址相同（将此项目编译后与后端一起打包，或者使用了反向代理）
            server: '',
            // ...其他代码
        }
        ```

2. 构建项目  


    ```bash
    # 安装依赖（国内可使用cnpm代替npm）
    npm install

    # 构建生产版本（构建完毕后，项目静态文件在/dist，将里面的文件部署到web服务器即可）
    npm run build
    ```

3. 部署项目，复制`/dist`目录下的文件到Web服务器
    1. 使用Nginx部署  
    
        ```nginx
        server{

            # 不开启SSL则使用下面两条被注释的配置
            # listen 80;
            # listen [::]:80;
            listen 443 ssl;
            listen [::]:443 ssl;

            # 主机名
            server_name 访问的主机名;
            client_max_body_size 8192m;

            # SSL配置（可选）
            ssl_certificate SSL证书crt路径;
            ssl_certificate_key SSL证书key路径;

            # 项目编译后的资源根目录
            root dist文件夹;
            index index.html;

            # 使用反向代理后端时可选配置
            location ~ (^/api|^/download) {
                proxy_pass http://127.0.0.1:8087;
                proxy_buffering off;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                index index.html index.htm;
            }

            # SSL自动转跳（可选）
            error_page 497 https://$server_name:344$request_uri;
        }
        ```
    2. 直接与后端打包  
        1. 将编译后产生的`dist`下的内容复制到后端项目的`/src/main/resources/static/`下  
        2. 依照[后端项目](https://gitee.com/xiaotao233/saltedfishcloud-backend)打包和运行步骤执行即可


## 部分前端界面展示
### 文件列表
![](./docs/img/2021-11-27-14-58-36.png)
![](./docs/img/2021-11-27-15-04-13.png)
![](./docs/img/2021-11-27-15-27-19.png)
![](./docs/img/屏幕截图%202021-11-27%20150700.jpg)
![](./docs/img/2021-11-27-15-11-33.png)
![](./docs/img/2021-11-27-15-12-45.png)