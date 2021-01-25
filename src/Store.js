import Vuex from 'vuex'
import Vue from 'vue'
Vue.use(Vuex)
const Store = new Vuex.Store({
    state: {
        userInfo: null
    },
    mutations: {
        setUserInfo(state, userInfo) {
            state.userInfo = userInfo
        }
    }
})
export default Store