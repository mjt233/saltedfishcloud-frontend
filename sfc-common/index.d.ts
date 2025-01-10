import { BootContext } from './model/Common'
import { ToRefs } from 'vue'
import { AppContext } from 'sfc-common/core/context/type'
import * as Vue from 'vue'
import { App } from 'vue'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import API from 'sfc-common/api'
import DPlayer from 'dplayer'
import * as FormUtils from 'sfc-common/utils/FormUtils'
import * as components from 'sfc-common/components'
import DOMUtils from 'sfc-common/utils/DOMUtils'
import * as MethodInterceptor from 'sfc-common/utils/MethodInterceptor'
import { StringFormatter } from 'sfc-common/utils/StringFormatter'
import { StringUtils } from 'sfc-common/utils/StringUtils'
import * as SfcCommon from 'sfc-common'
import * as monaco from 'monaco-editor'

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
    StringUtils: typeof StringUtils,
    SfcCommon: typeof SfcCommon
    monaco: typeof monaco
  }
}