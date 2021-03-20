import Vuex from 'vuex'
import Vue from 'vue'
Vue.use(Vuex)
const Store = new Vuex.Store({
    state: {
        userInfo: null,
        drawer: null,
        token: ""
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
        }
    },
    getters: {
        userInfo: state => {
            try {
                return JSON.parse(JSON.parse(window.atob(state.token.split('.')[1])).data)
            } catch (error) {
                return null
            }
        }
    }
})
export default Store