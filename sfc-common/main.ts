import 'sfc-common/styles/common.scss'
import bootContext from 'sfc-common/core/boot'
import { buildApp } from 'sfc-common/core/boot/AppFactory'
import 'sfc-common/core/boot/globalmount'
import App from 'sfc-common/App.vue'

// 拓展调试用的导入
// import '@/extension/video-enhance/main'
// import '@/extension/jntm/main'

bootContext.start(buildApp(App))