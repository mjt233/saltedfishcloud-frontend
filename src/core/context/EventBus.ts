import { EventNameConstants } from '../constans/EventName'

interface EventListenerMap {
  /**
   * 事件名称对应该事件一系列的订阅器
   */
   [otherKey: string]: Array<(e: any) => void>
}

export interface EventBus {
  /**
   * @see {EventNameConstants}
   */
  emit: (eventName: string, data?: any) => void,
  on: (eventName: string, fn: (e: any) => void) => void,
  off: (eventName: string, fn: (e: any) => void) => void
}

export class DefaultEventBus implements EventBus {
  private listenerMap: EventListenerMap = {}
  constructor() {
    this.listenerMap = {}
  }
  emit(eventName: string, data: any) {
    if (this.listenerMap[eventName]) {
      this.listenerMap[eventName].forEach(fn => {
        try {
          fn(data)
        } catch (err) {
          console.log(err)
        }
      })
    }
  }
  on(eventName: string, fn: (e: any) => void) {
    this.listenerMap[eventName] = this.listenerMap[eventName] || []
    this.listenerMap[eventName].push(fn)
  }

  off(eventName: string, fn: (e: any) => void) {
    const listeners = this.listenerMap[eventName]
    if (listeners) {
      const index = listeners.findIndex(e => e == fn)
      if (index != -1) {
        listeners.splice(index, 1)
      }
    }
  }
}
