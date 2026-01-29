export interface EventSupport<E extends Record<string, any[]>> {
  addEventListener<T extends keyof E>(type: T, listener: (...args: E[T]) => void): void
  removeEventListener<T extends keyof E>(type: T, listener: (...args: E[T]) => void): void
  getAllEventListeners<T extends keyof E>(): {
    type: T
    listener: Function
  }[]
}

export class EventSupportImpl<E extends Record<string, any[]>> implements EventSupport<E> {
  private eventListeners: Map<keyof E, Array<Function>> = new Map()

  addEventListener<T extends keyof E>(type: T, listener: (...args: E[T]) => void): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, [])
    }
    this.eventListeners.get(type)!.push(listener)
  }

  removeEventListener<T extends keyof E>(type: T, listener: (...args: E[T]) => void): void {
    const listeners = this.eventListeners.get(type)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }
    
  /**
   * 派发事件
   * @param type 事件类型
   * @param args 事件参数
   */
  dispatchEvent<T extends keyof E>(type: T, ...args: E[T]): void {
    const listeners = this.eventListeners.get(type)
    if (listeners) {
      listeners.forEach(listener => {
        listener(...args)
      })
    }
  }

  getAllEventListeners<T extends keyof E>(): { type: T; listener: Function }[] {
    return Array.from(this.eventListeners.keys()
      .flatMap(type => {
        const listeners = this.eventListeners.get(type) as Function[]
        return listeners.map(listener => {
          return {
            type: type as T,
            listener
          }
        })
      }))
  }

}

