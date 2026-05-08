
import { SfcUtils } from 'sfc-common/utils/SfcUtils'
import { defineComponent, ToRefs } from 'vue'
import { AppContext } from 'sfc-common/core/context/type'
import * as Vue from 'vue'
import { App } from 'vue'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import API from 'sfc-common/api'
import DPlayer from 'dplayer'
import { BootContext } from 'sfc-common/model'
import * as FormUtils from 'sfc-common/utils/FormUtils'
import * as components from 'sfc-common/components'
import DOMUtils from 'sfc-common/utils/DOMUtils'
import * as MethodInterceptor from 'sfc-common/utils/MethodInterceptor'
import { StringFormatter } from 'sfc-common/utils/StringFormatter'
import { StringUtils } from 'sfc-common/utils/StringFormatter'
import * as SfcCommon from 'sfc-common'
import * as echarts from 'echarts'
import { getContext } from 'sfc-common/core/context'
import * as monaco from 'monaco-editor'
import * as qs from 'qs'

declare global {
  interface Window {
    context: ToRefs<AppContext>
    getContext: typeof getContext,
    Vue: typeof Vue,
    SfcUtils: typeof SfcUtils,
    API: typeof API,
    DPlayer: typeof DPlayer
    app: App<Element>,
    bootContext: BootContext,
    FormUtils: typeof FormUtils
    components: typeof components,
    Components: typeof components,
    DOMUtils: typeof DOMUtils,
    MethodInterceptor: typeof MethodInterceptor,
    StringFormatter: typeof StringFormatter,
    StringUtils: typeof StringUtils,
    SfcCommon: typeof SfcCommon,
    echarts: typeof echarts,
    monaco: typeof monaco,
    qs: typeof qs,
  }
}
