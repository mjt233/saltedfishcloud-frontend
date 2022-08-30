import { BootContextHandler } from './../model/Common'

const element = document.querySelector('#boot-info-container') as HTMLElement
const titleEl = element.querySelector('.title') as HTMLElement
const logBox = element.querySelector('.log-box') as HTMLElement


const createMessageDOM = (msg: string, tempHandler: (tempEl:HTMLElement) => any) => {
  var el = document.createElement('div')
  el.innerText = msg
  tempHandler(el)
  return el
}

const BootContextHandlerImpl: BootContextHandler = {
  setBootTaskTitle: function(title: string): void {
    titleEl.innerText = title
  },
  getBootInfoElement: function(): HTMLElement {
    return element
  },
  logError: function(msg: string): void {
    logBox.appendChild(createMessageDOM(msg, e => e.style.color = 'red'))
  },
  logWarning: function(msg: string): void {
    logBox.appendChild(createMessageDOM(msg, e => e.style.color = 'yellow'))
  },
  logInfo: function(msg: string): void {
    logBox.appendChild(createMessageDOM(msg, e => e.style.color = 'black'))
  }
}

export default BootContextHandlerImpl