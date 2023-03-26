import * as MethodInterceptor from 'sfc-common/utils/MethodInterceptor'
import DPlayer from 'dplayer'
import router from 'sfc-common/plugins/router'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { context } from '../context'
import * as Vue from 'vue'
import * as FormUtils from 'sfc-common/utils/FormUtils'
import API from 'sfc-common/api'
import { bootContext } from './BootCore'
import * as components from 'sfc-common/components'
import DOMUtils from 'sfc-common/utils/DOMUtils'
import { StringFormatter } from 'sfc-common/utils/StringFormatter'
import { StringUtils } from 'sfc-common/utils/StringUtils'
import * as SfcCommon from 'sfc-common'
import * as echarts from 'echarts'


/**
 * 挂载全局属性
 */
context.routeInfo.value.router = router
window.context = context
window.Vue = Vue
window.SfcUtils = SfcUtils
window.API = API
window.DPlayer = DPlayer as any
window.bootContext = bootContext
window.FormUtils = FormUtils
window.components = components
window.DOMUtils = DOMUtils
window.MethodInterceptor = MethodInterceptor
window.StringFormatter = StringFormatter
window.StringUtils = StringUtils
window.SfcCommon = SfcCommon
window.echarts = echarts

export {}