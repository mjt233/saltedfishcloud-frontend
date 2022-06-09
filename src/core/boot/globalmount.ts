import router from '@/plugins/router'
import SfcUtils from '@/utils/SfcUtils'
import { context } from '../context'
import * as Vue from 'vue'

/**
 * 挂载全局属性
 */
context.routeInfo.value.router = router
window.context = context
window.Vue = Vue
window.SfcUtils = SfcUtils

export {}