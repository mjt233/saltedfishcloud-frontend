import Vuex from 'vuex'
import Vue from 'vue'
import API from './api'
Vue.use(Vuex)
const Store = new Vuex.Store({
    state: {
        userInfo: null,
        drawer: null,
        token: '',
        avatarURL: API.server + '/api/static/static/defaultAvatar.png'
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
