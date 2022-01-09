import Store from '@/Store'
import mdui from 'mdui'
import API from './api'

const GlobalHandler = {
    /**
     * 用户登出
     * @param {Vue} vm Vue实例，可留空
     */
    logout(vm) {
        localStorage.clear()
        Store.commit('setToken', null)
        Store.commit('setUserInfo', null)
        Store.commit('setAvatarURL', API.getServer() + '/api/' + API.user.getAvatar().url)
        mdui.snackbar('退出成功')
        if (vm && (vm.$route.name == 'privateDisk' || vm.$route.name == 'my')) {
            vm.$nextTick().then(() => {
                vm.$router.push('/login')
            })
        }
    }
}

export default GlobalHandler
