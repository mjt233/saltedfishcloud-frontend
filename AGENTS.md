## 核心 UI 框架
- **基础框架**: Vue 3
- **UI 组件库**: Vuetify 4.0.0
- **CSS 方案**: Tailwind CSS (用于辅助布局与微调)、SCSS

## 前端组件与样式规范

需要创建组件或改动组件样式时，请参考规范[前端样式说明](./docs/front-end-style.md)

## 通用代码规范

- 需要通过对话框打开组件时，使用`SfcUtils.openComponentDialog`
- 所有类/对象、类/对象的字段、方法/函数、interface、type、Vue组件的props和watch都需要有详细的jsdoc注释
- 生成的代码中，每个关键步骤需要有行内注释，新生成的函数需要有jsdoc注释


## 工作流与验证机制


### 行为约束

- 禁止直接修复与用户要求无关的顺手发现的bug。发现与本次任务无关的bug应反馈给用户。

### 编译验证

- 修改代码文件后，需要使用`npx vue-tsc --noEmit`验证确保没有类型错误


### Git 提交规范

- 当用户要求你将文件提交到Git时，请参考[Git 提交规范](./docs/git-commit-convention.md)
- 除非用户明确要求后续执行的修改都自动提交git，否则禁止在执行完任务后立即提交git。请等待用户的明确指示后再执行git提交。