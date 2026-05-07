import { getContext } from 'sfc-common/core'
import { EventBus } from 'sfc-common/core/context/EventBus'
import { inject, onBeforeUnmount } from 'vue'

interface EventListener {
  eventName: string
  fn: (e: any) => void
}
class EventBusWrapper implements EventBus {
  private listener: EventListener[]
  constructor(private delegate: EventBus) {
    this.listener = []
  }
  emit(eventName: string, data?: any) {
    this.delegate.emit(eventName, data)
  }
  on(eventName: string, fn: (e: any) => void) {
    this.listener.push({
      eventName,
      fn
    })
    this.delegate.on(eventName, fn)
  }
  off(eventName: string, fn: (e: any) => void) {
    this.delegate.off(eventName, fn)
    this.listener = this.listener.filter(e => e.eventName != eventName && e.fn != fn)
  }

  clear() {
    this.listener.forEach(e => {
      this.delegate.off(e.eventName, e.fn)
    })
    this.listener = []
  }
}

/**
 * 自动跟随组件生命周期订阅事件的事件总线。当组件卸载后自动取消事件监听
 * @param listeners 快捷默认添加的监听器
 */
export function useEventBus(listeners?: Record<string, (e: any) => void>) {
  const eventBus = new EventBusWrapper(getContext().eventBus.value)

  onBeforeUnmount(() => {
    eventBus.clear()
  })
  if (listeners) {
    Object.keys(listeners).forEach(eventName => {
      eventBus.on(eventName, listeners[eventName])
    })
  }
  return eventBus
}