import { SfcUtils } from '@/utils/SfcUtils'
import { defineComponent, ToRefs } from 'vue'
import { AppContext } from './core/context/type'
import * as Vue from 'vue'
import SfcUtils from './utils/SfcUtils'
import API from './api'
import DPlayer from 'dplayer'

declare global {
  interface Window {
    context: ToRefs<AppContext>
    Vue: typeof Vue,
    SfcUtils: typeof SfcUtils,
    API: typeof API,
    DPlayer: typeof DPlayer
  }
}