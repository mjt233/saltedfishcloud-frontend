## 核心 UI 框架
- **基础框架**: Vue 3
- **UI 组件库**: Vuetify 4.0.0
- **CSS 方案**: Tailwind CSS (用于辅助布局与微调)、SCSS

## 开发调试服务

默认服务端口为 4000，可通过 [http://localhost:4000](http://localhost:4000) 访问
开发环境默认员账号消息

| 用户名 | 密码 |
| ------| ----- |
| admin | admin666 |

## Vue 路由定义

主模块的顶层只配置了2个路由：用户界面`/`与管理员界面`/admin`，其他页面的路由全部必须为这两个路由的子路由以确保通用的header和侧边栏菜单能正常渲染。

主模块路由配置定义见：`sfc-common/plugins/router/index.ts`

## 前端组件与样式规范

- 需要创建组件或改动组件样式时，请参考规范[Vue组件规范说明](./docs/vue-component-style.md) 与 [前端样式说明](./docs/front-end-style.md)
- 尽可能使用以下组件实现一些通用的系统功能
  | 组件名称 | 用途 |
  | ------- | ----- |
  | PathSelector | 选择网盘文件/目录路径 |
  | ProxySelector | 代理配置选择 | 

## 通用代码规范

- 需要通过对话框打开组件时，使用`SfcUtils.openComponentDialog`
- 所有类/对象、类/对象的字段、方法/函数、interface、type、Vue组件的props和watch都需要有详细的jsdoc注释
- 生成的代码中，每个关键步骤需要有行内注释，新生成的函数需要有jsdoc注释
- 涉及异步的函数优先使用async / await

## 插件模块开发规范

插件模块指的是位置在 `sfc-ext` 下的模块，插件模块应遵循以下规则：
- 对主模块`sfc-common`的非type导入（如：组件、SfcUtils、API、StringFormatter）仅允许从 `build/extension/external-lib-paths.js` 中定义的 `externalSfcCommonPath` 导入。如果需要用到主模块未在可用路径中导出，则提示用户

## 工作流与验证机制


### 行为约束

- 禁止直接修复与用户要求无关的顺手发现的bug。发现与本次任务无关的bug应反馈给用户。
- 遇到用户未明确提供的接口，项目已有代码中不存在且不确定的接口必须询问用户，让用户提供对应的接口定义文件位置

### 编译验证

- 修改代码文件后，需要使用`npm run typecheck`验证确保没有类型错误


### Git 提交规范

- 当用户要求你将文件提交到Git时，请参考[Git 提交规范](./docs/git-commit-convention.md)
- 除非用户明确要求后续执行的修改都自动提交git，否则禁止在执行完任务后立即提交git。请等待用户的明确指示后再执行git提交。