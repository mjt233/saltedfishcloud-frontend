import { McpOAuthCallbackData } from '../model'

export function waitOAuthCallback(): Promise<string> {
  return new Promise((resolve, reject) => {
    const cb = (e: MessageEvent<McpOAuthCallbackData>) => {
      console.log(e)
      if (e.data.type !== 'McpOAuthCallbackData') {
        return
      }
      if (e.data.isSuccess) {
        resolve(e.data.apiTicket!)
      } else {
        reject(e.data.msg)
      }
      window.removeEventListener('message', cb)
    }
    window.addEventListener('message', cb)
  })
}