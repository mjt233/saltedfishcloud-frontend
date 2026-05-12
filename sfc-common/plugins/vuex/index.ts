// @ts-ignore - vuex 4.x does not expose types via package.json exports field with moduleResolution:bundler
import { createStore } from 'vuex'

interface StoreState {
  userInfo: Record<string, unknown> | null
  drawer: boolean | null
  token: string
  avatarURL: string
}

const Store = createStore({
  state: {
    userInfo: null,
    drawer: null,
    token: '',
    avatarURL: '/api/static/defaultAvatar.png'
  } as StoreState,
  mutations: {
    setDrawer(state: StoreState, drawer: boolean) {
      state.drawer = drawer
    },
    setToken(state: StoreState, token: string) {
      state.token = token
      try {
        state.userInfo = JSON.parse(JSON.parse(window.atob(state.token.split('.')[1])).data)
      } catch (error) {

      }
    },
    setUserInfo(state: StoreState, userInfo: Record<string, unknown>) {
            
      state.userInfo = userInfo
    },
    setAvatarURL(state: StoreState, url: string) {
      state.avatarURL = url
    }
  },
  getters: {
    userInfo: (state: StoreState) => {
      return state.userInfo
    }
  }
})
export default Store
