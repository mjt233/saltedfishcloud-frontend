// 咸鱼云前端核心模块
export const externalSfcCommonPath = [
  'sfc-common', 'sfc-common/components', 'sfc-common/utils/SfcUtils/index.js', 'sfc-common/utils/SfcUtils'
]

// 公共库
export const externalPublicLibPath = [
  'vue', 'dplayer', 'vuetify', 'vuetify/components', 'qs', 'monaco-editor'
]

/**
 * 插件构建时外部化（不打入包）的依赖路径白名单。
 * 这些模块在运行时由宿主（咸鱼云核心前端）提供，插件构建时应标记为 external。
 * @type {string[]}
 */
export const externalLibPath = [
  ...externalSfcCommonPath,
  ...externalPublicLibPath
]
