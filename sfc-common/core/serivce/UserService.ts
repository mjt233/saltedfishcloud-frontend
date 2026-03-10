import API from 'sfc-common/api'
import { LoginForm, UserBindConfirm } from 'sfc-common/components'
import { RawUser, ThirdPartyAuthPlatform, ThirdPartyPlatformCallbackResult } from 'sfc-common/model'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { DialogPromise, ComponentDialogInstance } from 'sfc-common/utils/SfcUtils/common/Dialog'
import { getContext } from '..'

export namespace UserService {

  /**
   * 通过第三方登录创建新的用户
   * @param actionId 第三方登录动作id
   * @returns 创建结果
   */
  export async function createByThirdParty(actionId: string) {
    const res = await SfcUtils.request(API.oauth.createUser(actionId))
    return {
      user: res.data.data.user,
      token: res.data.data.newToken
    }
  }

  /**
   * 开始第三方登录流程
   * @param platform 第三方平台对象
   * @returns 登录结果
   */
  export async function startThirdPlatformLogin(platform: ThirdPartyAuthPlatform) {
    let loginContext = {} as {
      loadingDialog?: DialogPromise & ComponentDialogInstance
      loginPlatform?: ThirdPartyAuthPlatform
      finish?: boolean,
      result?: ThirdPartyPlatformCallbackResult,
      token?: string,
      resolve: (value?: unknown) => void,
      reject: (reason?: any) => void,
      err?: any
    }

    function doThirdPlatformLogin(platform: ThirdPartyAuthPlatform) {
      return new Promise((resolve, reject) => {
        
        loginContext = { resolve, reject }
        window.addEventListener('message', msgCallback)
        SfcUtils.openSmallWindow(platform.authUrl)
        loginContext.loadingDialog = SfcUtils.loadingDialog({
          msg: '等待第三方授权',
          closeable: true,
          onCancel() {
            window.removeEventListener('message', msgCallback)
            loginContext.loginPlatform = undefined
            if (!loginContext.finish) {
              loginContext.reject('cancel')
            }
            return true
          },
        })
      })
    }

    async function msgCallback(e: MessageEvent) {
      const name = e.data?.name as string | undefined
      if (name == 'thirdPlatformCallbackError' || name == 'thirdPlatformCallbackSuccess') {
        await SfcUtils.sleep(250)
        try {
          if (name == 'thirdPlatformCallbackError') {
            await thirdFailCallback(e.data.data.errMsg)
          } else if (name == 'thirdPlatformCallbackSuccess') {
            await thirdSuccessCallback(e.data.data.result, e.data.data.newToken)
          }
        } catch (err) {
          if (err != 'cancel') {
            console.error(err)
            SfcUtils.alert(err?.toString() as string, '错误')
          }
        } finally {
          loginContext.loadingDialog?.close()
          window.removeEventListener('message', msgCallback)
          loginContext.resolve()
        }
      }
    }

    
    async function thirdSuccessCallback(res: ThirdPartyPlatformCallbackResult, newToken: string) {
      loginContext.result = res
      loginContext.token = newToken

      // 判断是否为首次登录的第三方账号
      if(res.isNewUser) {
        // 新的第三方账号，但存在部分信息与已有的账号相关联，需要确认关联
        if (res.user) {
          return new Promise((resolve, reject) => {
            SfcUtils.openComponentDialog(UserBindConfirm, {
              props: {
                bindUser: res.user,
                platformName: res.platformUser.userName,
                platformIcon: platform.icon,
                platformUser: res.platformUser
              },
              async onConfirm() {
                const bindDialog = SfcUtils.loadingDialog({msg: '绑定中...'})
                try {
                  const bindRes = await SfcUtils.request(API.oauth.bindUser({ actionId: res.actionId, autoBind: true }))
                  loginContext.token = bindRes.data.data.token
                  doLoginSuccess(bindRes.data.data, bindRes.data.data.token as string)
                  return true
                } catch (err) {
                  console.error(err)
                  loginContext.err = err
                  return false
                } finally {
                  bindDialog.close()
                }
              },
              onCancel() {
                if (loginContext.finish) {
                  resolve(null)
                } else {
                  SfcUtils.snackbar('关联已取消')
                  reject(loginContext.err || 'cancel')
                }
                return true
              },
            })
          })
        }
        // 全新的第三方账号第一次登录
        return SfcUtils.confirm('您是首次通过第三方登录，是否需要绑定到现有的咸鱼云用户？', '绑定确认', {
          cancelToReject: true,
          persistent: true,
          confirmBtnText: '绑定账号',
          cancelBtnText: '作为新用户'
        })
          .then(async() => {
            await new Promise((resolve, reject) => {
              const bindFormDialog = SfcUtils.openComponentDialog(LoginForm, {
                props: {
                  showLogin: false,
                  showThirdPartyPlatform: false,
                  plain: true
                },
                async onConfirm() {
                  try {
                    bindFormDialog.beginLoading()
                    const bindForm = bindFormDialog.getInstAsForm()
                    const validRes = await bindForm.validate()
                    if (!validRes.valid) {
                      SfcUtils.snackbar(validRes.errors.map(e => e.errorMessages).join('; '))
                      return false
                    }
                    const formData = bindForm.getFormData()
                    const bindResult = await SfcUtils.request(API.oauth.bindUser({
                      actionId: res.actionId,
                      account: formData.username,
                      password: formData.password,
                      autoBind: false
                    }))
                    doLoginSuccess(bindResult.data.data, bindResult.data.data.token)
                  } catch (err) {
                    SfcUtils.snackbar(err)
                    return false
                  } finally {
                    bindFormDialog.closeLoading()
                  }
                  return true
                },
                onCancel() {
                  if (loginContext.finish) {
                    resolve(null)
                  } else {
                    reject()
                  }
                  return true
                },
              })
            })
          })
          .catch(async err => {
            // 不绑定现有用户，直接创建新用户
            if (err != 'cancel') {
              return Promise.reject(err)
            }
            const createDialog = SfcUtils.loadingDialog({msg: '正在创建用户'})
            try {
              const createRes = await createByThirdParty(res.actionId)
              doLoginSuccess(createRes.user, createRes.token)
            } catch(err) {
              loginContext.err = err
              loginContext.finish = false
            } finally {
              createDialog.close()
            }
          })
      } else {
        // 不是第一次登录的第三方账号，且已关联了系统账号，需要判断是否与当前已登录账号一致，不一致的需要拒绝操作
        const curUser = getContext().session.value.user
        if (curUser.id != 0 && curUser.id != res.user.id) {
          return Promise.reject(`第三方平台 ${platform.name} 的用户 ${res.platformUser.userName} 已关联了账号 ${res.user.user}，请勿重复关联`)
        }
        doLoginSuccess(res.user, newToken)
      }
    }
    

    function doLoginSuccess(user: RawUser, token: string) {
      if(loginContext.result) {
        loginContext.result.user = user
      }
      loginContext.token = token
      loginContext.finish = true
    }

    async function thirdFailCallback(errMsg: string) {
      SfcUtils.alert(errMsg)
    }

    try {
      await doThirdPlatformLogin(platform)
    } catch (err) {
      if (err != 'cancel') {
        SfcUtils.snackbar(err)
        console.error(err)
      }
    }
    return {
      success: loginContext.finish || false,
      result: loginContext.result,
      token: loginContext.token
    }
  }
}