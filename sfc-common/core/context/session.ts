import { SessionUser } from 'sfc-common/model/'
import { reactive } from 'vue'
import { context } from '.'



export interface Session {
  token: string,
  user: SessionUser,
  setToken(token: string): void,
  loadToken(): void,
  setUserInfo(userObj: any): void,
  logout(): Promise<any>
}

export function getPublicUser(): SessionUser {
  return {
    id: 0,
    name: 'public',
    role: 'public',
    email: '',
    quota: 0
  }
}

const emptySession: Session = {
  token: '',
  user: getPublicUser(),
  setToken(token) {
    this.token = token
    localStorage.setItem('token', token)
    document.cookie = `token=${this.token}; path=/`
  },
  loadToken() {
    this.token = localStorage.getItem('token') || ''
    if (this.token && this.token.length != 0) {
      document.cookie = `token=${this.token}; path=/`
    }
  },
  setUserInfo(userObj) {
    const userInfo: SessionUser = {
      id: userObj.id,
      name: userObj.user || userObj.name,
      quota: userObj.quota,
      role: userObj.type == 1 ? 'admin' : 'normal',
      email: userObj.email
    }
    this.user = reactive(userInfo)
  },
  async logout() {
    this.token = ''
    this.user = reactive(getPublicUser())
    localStorage.clear()
    document.cookie = `token=; expires=${new Date().toUTCString()}; path=/`

    if (!context.routeInfo.value.curr?.meta.allowNoLogin) {
      await context.routeInfo.value.router?.push('/')
    }
  }
}

export {
  emptySession
}