import { createStore } from 'vuex'
const Store = createStore({
    state: {
        userInfo: null,
        drawer: null,
        token: '',
        avatarURL: '/api/static/defaultAvatar.png'
    },
    mutations: {
        setDrawer(state, drawer) {
            state.drawer = drawer
        },
        setToken(state, token) {
            state.token = token
            try {
                state.userInfo = JSON.parse(JSON.parse(window.atob(state.token.split('.')[1])).data)
            } catch (error) {

            }
        },
        setUserInfo(state, userInfo) {
            state.userInfo = userInfo
        },
        setAvatarURL(state, url) {
            state.avatarURL = url
        }
    },
    getters: {
        userInfo: state => {
            return state.userInfo
        }
    }
})
export default Store
