import * as xterm from 'xterm'
declare global {
  interface Window {
    xterm: typeof xterm
  }
}