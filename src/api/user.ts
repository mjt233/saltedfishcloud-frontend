import { CommonRequest, PageRequest, RawUser } from '@/core/model'

export interface UserRegOpt {
  // 用户名
  user: string,
  
  // 登录密码
  passwd: string,
  
  // 注册邀请码，如果是管理员用户请求该接口，则不需要填写邀请码。若使用邮箱注册，该字段则使用邮箱验证码。
  regcode: string,
  
  // 邮箱，邮箱注册方式需要填写这个字段。若使用邀请码方式注册，该字段不会被处理
  email: string,
  
  // 用户类型 1 - 管理员，0 - 普通用户，只有当管理员用户调用该字段时才有效
  type?: '1' | '0' | string,
  
  // 是否使用邮箱方式注册 true - 是，false - 邀请码注册。使用邮箱方式注册时会验证email字段的有效性
  validEmail: boolean,
  
}
const user = {
  prefix: '/user',
  /**
     * 发送绑定新邮箱的验证码
     * @param {String} email 接收验证码的新邮箱
     * @returns {import("axios").AxiosRequestConfig}
     */
  sendBindEmail(email: string): CommonRequest {
    return {
      url: `${this.prefix}/sendBindEmail`,
      data: {
        email: email
      },
      method: 'post'
    }
  },
  /**
   * 更新token
   */
  updateToken(): CommonRequest<string> {
    return {
      url: `${this.prefix}/updateToken`,
      method: 'post'
    }
  },
  /**
   * 绑定新邮箱
   * @param {String} newEmail 新邮箱
   * @param {String} originCode 旧邮箱验证码，若先前未绑定邮箱则不需要
   * @param {String} newCode 新邮箱验证码
   */
  bindNewEmail(newEmail: string, originCode: string, newCode: string): CommonRequest {
    return {
      url: `${this.prefix}/newMail`,
      method: 'post',
      data: {
        email: newEmail,
        originCode: originCode,
        newCode: newCode
      }
    }
  },
  /**
   * 用于验证旧邮箱的验证码是否正确
   * @param {String} code 验证码
   */
  verifyEmail(code: string): CommonRequest {
    return {
      url: `${this.prefix}/verifyEmail`,
      method: 'post',
      data: {
        code: code
      }
    }
  },
  /**
   * 发送用于验证旧邮箱的验证码
   */
  sendVerifyEmail(): CommonRequest {
    return {
      url: `${this.prefix}/sendVerifyEmail`,
      method: 'post'
    }
  },
  /**
   * 发送重置密码邮箱验证码
   * @param {String} account 用户名或邮箱
   * @param {String} code 验证码
   * @param {String} password 新密码
   */
  resetPassword(account: string, code: string, password: string): CommonRequest {
    return {
      url: `${this.prefix}/resetPassword`,
      data: {
        account: account,
        code: code,
        password: password
      },
      method: 'post'
    }
  },
  /**
   * 发送重置密码邮箱验证码
   * @param {String} account 用户名或邮箱
   * @returns {import("axios").AxiosRequestConfig}
   */
  sendResetPasswordEmail(account: string): CommonRequest {
    return {
      url: `${this.prefix}/sendResetPasswordEmail`,
      data: {
        account: account
      },
      method: 'post'
    }
  },
  /**
   * 获取邮箱注册验证码
   * @param {String} email 接收的邮箱
   */
  getEmailRegCode(email: string): CommonRequest {
    return {
      url: `${this.prefix}/regcode`,
      data: {
        email: email
      },
      method: 'post'
    }
  },
  /**
   * 获取系统开放的注册类型
   */
  getRegType(): CommonRequest<{email: boolean, regcode: boolean}> {
    return {
      url: `${this.prefix}/regType`
    }
  },
  /**
   * 设置用户的类型
   * @param {Number} uid      目标用户ID
   * @param {Boolean} isAdmin 是否设为管理员
   */
  setUserType(uid: number, isAdmin: boolean): CommonRequest {
    return {
      url: `${this.prefix}/${uid}/type/${isAdmin ? '1' : '0'}`,
      method: 'put'
    }
  },
  /**
   * 获取用户列表
   * @param {Number} page 页码
   * @returns
   */
  getUserList(page = 1): PageRequest<RawUser> {
    return {
      url: `${this.prefix}/list`,
      params: {
        page: page
      }
    }
  },
  /**
   * 注册新用户
   */
  regUser(regOpt: UserRegOpt): CommonRequest {
    return {
      url: this.prefix,
      method: 'post',
      data: regOpt
    }
  },
  /**
   * 用户登录
   * @param {String} user 用户
   * @param {String} passwd 密码
   * @returns token
   */
  login(user: string, passwd: string): CommonRequest<string> {
    return {
      url: this.prefix + '/token',
      method: 'post',
      params: {
        user: user,
        passwd: passwd
      }
    }
  },
  /**
   * 获取用户信息
   */
  getUserInfo(): CommonRequest<RawUser> {
    return {
      url: this.prefix,
      method: 'get'
    }
  },
  /**
   * 上传用户头像
   * @param {File} img 头像文件
   * @returns
   */
  uploadAvatar(img: File): CommonRequest {
    const fd = new FormData()
    fd.append('file', img)
    return {
      url: this.prefix + '/avatar',
      method: 'post',
      data: fd
    }
  },
  /**
   * 获取用户头像
   * @param {String} username 用户名
   * @returns
   */
  getAvatar(username: string): {url: string} {
    return {
      url: this.prefix + '/avatar' + (username ? `/${username}` : '')
    }
  },
  /**
   * 获取配额使用情况
   * @returns
   */
  getQuotaUsed(): CommonRequest<{used: number, quota: number}> {
    return {
      url: this.prefix + '/quota'
    }
  },

  /**
   *
   * @param {Number} uid 用户ID
   * @param {String} oldPasswd 旧密码
   * @param {String} newPasswd 新密码
   * @param {String} force     强制修改
   * @returns
   */
  modifyPasswd(uid: number, oldPasswd: string, newPasswd: string, force: string = 'false'): CommonRequest {
    const res = {
      url: `${this.prefix}/${uid}/passwd`,
      method: 'post',
      data: {
        old: oldPasswd,
        new: newPasswd,
        force
      }
    }
    return res
  }
}

export default user