# 咸鱼云网盘 前端样式说明

## 样式优先级规则 (重要)

在编写样式时，必须遵循以下优先级顺序，严禁随意在 `<style>` 中编写原生 CSS：
1. **Vuetify Props**: 优先使用组件自带的属性（如 `color`, `elevation`, `density`）。
2. **Vuetify Utility Classes**: 使用内置的间距、文字格式工具类（如 `pa-4`, `text-h5`, `rounded-lg`）。
3. **Tailwind CSS**: 仅在 Vuetify 工具类无法满足需求时使用（如 `flex-1`, `grid-cols-4`, `gap-2`）。
4. **Scoped CSS**: 只有在处理复杂的第三方库样式覆盖或极个别特殊动画时使用，且必须开启 `scoped`。
5. **SCSS**: 需要编写自定义css style样式时，需要使用`scss`: `<style lang="scss"> </style>`

## Vuetify 与组件使用规范

- Vue 模板内部的组件统一使用 PascalCase 命名，如：`VContainer`，`VCard`
- 除非明确指定，表单的输入组件（如：`VTextField`、`VSelect`）不要指定`density`和`variant`

## 布局规范

- **响应式设计**: 必须适配多种屏幕。
  - 使用 `<VContainer>`, `<VRow>`, `<VCol>` 处理网格布局。
  - 响应式断点遵循 Vuetify 标准（xs, sm, md, lg, xl）。
- **间距一致性**: 
  - 统一使用 `n * 4px` 的步长。例如：`ma-2` 代表 `8px`，`pa-4` 代表 `16px`。
  - 严禁在代码中出现 `margin: 13px` 这种非标准数字。

## 💎 组件使用准则
- **颜色语义**:
  - `primary`: 品牌主色。
  - `secondary`: 辅助色。
  - `error`: 危险/报错（删除操作）。
  - `success`: 成功提醒。

## 🌗 主题适配
- 项目支持深色/浅色模式切换。
- **严禁**硬编码颜色值（如 `#ffffff` 或 `black`）。
- **必须**使用语义化颜色或 CSS 变量：
  - 正确示例：`<VCard color="surface" class="text-on-surface">`。
