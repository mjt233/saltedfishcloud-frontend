import Vuex from 'vuex'
import Vue from 'vue'
Vue.use(Vuex)
const Store = new Vuex.Store({
    state: {
        userInfo: null,
        drawer: null
    },
    mutations: {
        setUserInfo(state, userInfo) {
            state.userInfo = userInfo
        },
        setDrawer(state, drawer) {
            state.drawer = drawer
        }
    }
})
export default Store