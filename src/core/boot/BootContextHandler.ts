import { BootLoaderVue } from '@/components/common/BootLoader'
import { BootContextHandler } from './../model/Common'
import { buildApp } from './AppFactory'

const bootApp = buildApp(BootLoaderVue)
bootApp.mount('#boot-info-container')
const handler =  bootApp._instance?.exposeProxy as BootContextHandler
export default handler