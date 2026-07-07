/**
 * 插件构建时外部化（不打入包）的依赖路径白名单。
 * 这些模块在运行时由宿主（咸鱼云核心前端）提供，插件构建时应标记为 external。
 * @type {string[]}
 */
export const externalLibPath = [
  // 公共库
  'vue', 'dplayer', 'vuetify', 'vuetify/components', 'qs', 'monaco-editor',

  // 咸鱼云前端核心模块
  'sfc-common', 'sfc-common/components', 'sfc-common/utils/SfcUtils/index.js', 'sfc-common/utils/SfcUtils'
]
