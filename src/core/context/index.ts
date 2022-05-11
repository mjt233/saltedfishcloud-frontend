import { AppContext, Session } from './type'
import defaultAppMenu from './menu'
import { reactive, ref, toRefs, ToRefs } from 'vue'
import axios from '@/plugins/axios'

const emptySession: Session = {
  token: '',
  user: {
    id: 0,
    name: 'public',
    role: 'public'
  }
}

const context: ToRefs<AppContext> = toRefs(reactive({
  appTitle: '咸鱼云网盘',
  theme: 'default',
  mainMenu: defaultAppMenu,
  defaultAvatar: '/api/static/defaultAvatar.png',
  session: emptySession
}))


export {
  context
}

export * from './menu/type'
export * from './type'