import '@/styles/common.scss'
import * as boot from './core/boot'
import './core/boot/globalmount'
type BootProcessor = typeof boot & { [key: string]: () => Promise<void> }


const mountApp = boot.mountApp

/**
 * 启动任务，在挂载App之前会执行的函数Promise集合
 */
const bootTask: Promise<void>[] = []

/**
 * 执行所有启动前动作函数
 */
Object.keys(boot)
  .filter(name => name != 'mountApp')
  .map(name => (boot as BootProcessor)[name])
  .forEach(task => {
    bootTask.push(task())
  })



Promise.all(bootTask).finally(() => {
  mountApp()
})
