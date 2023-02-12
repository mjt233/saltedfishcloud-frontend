import * as MethodInterceptor from '@/utils/MethodInterceptor'
import DPlayer from 'dplayer'
import router from '@/plugins/router'
import SfcUtils from '@/utils/SfcUtils'
import { context } from '../context'
import * as Vue from 'vue'
import * as FormUtils from '@/utils/FormUtils'
import API from '@/api'
import { bootContext } from './BootCore'
import * as components from '@/components'
import DOMUtils from '@/utils/DOMUtils'
import { StringFormatter } from '@/utils/StringFormatter'
import { StringUtils } from '@/utils/StringUtils'

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

export {}