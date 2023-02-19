
import { SfcUtils } from 'sfc-common/utils/SfcUtils'
import { defineComponent, ToRefs } from 'vue'
import { AppContext } from './core/context/type'
import * as Vue from 'vue'
import { App } from 'vue'
import SfcUtils from './utils/SfcUtils'
import API from './api'
import DPlayer from 'dplayer'
import { BootContext } from './core/model'
import * as FormUtils from 'sfc-common/utils/FormUtils'
import * as components from 'sfc-common/components'
import DOMUtils from 'sfc-common/utils/DOMUtils'
import * as MethodInterceptor from 'sfc-common/utils/MethodInterceptor'
import { StringFormatter } from 'sfc-common/utils/StringFormatter'
import { StringUtils } from 'sfc-common/utils/StringFormatter'

declare global {
  interface Window {
    context: ToRefs<AppContext>
    Vue: typeof Vue,
    SfcUtils: typeof SfcUtils,
    API: typeof API,
    DPlayer: typeof DPlayer
    app: App<Element>,
    bootContext: BootContext,
    FormUtils: typeof FormUtils
    components: typeof components,
    DOMUtils: typeof DOMUtils,
    MethodInterceptor: typeof MethodInterceptor,
    StringFormatter: typeof StringFormatter,
    StringUtils: typeof StringUtils
  }
}