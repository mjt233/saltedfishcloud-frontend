import { reactive } from 'vue'
import { useRoute } from 'vue-router'
import { context } from '.'


export type UserRole = 'admin' | 'normal' | 'public'
export interface User {
  id: number,
  name: string,
  role: UserRole
}

export interface Session {
  token: string,
  user: User,
  setToken(token: string): void,
  loadToken(): void,
  setUserInfo(userObj: any): void,
  logout(): Promise<any>
}

const emptySession: Session = {
  token: '',
  user: {
    id: 0,
    name: 'public',
    role: 'public'
  },
  setToken(token) {
    this.token = token
    localStorage.setItem('token', token)
  },
  loadToken() {
    this.token = localStorage.getItem('token') || ''
  },
  setUserInfo(userObj) {
    if (!userObj.name) {
      userObj.name = userObj.user
    }
    this.user = reactive(userObj)
  },
  async logout() {
    this.token = ''
    this.user = reactive({
      id: 0,
      name: 'public',
      role: 'public'
    })
    localStorage.clear()

    if (!context.routeInfo.value.curr?.meta.allowNoLogin) {
      await context.routeInfo.value.router?.push('/')
    }
  }
}

export {
  emptySession
}