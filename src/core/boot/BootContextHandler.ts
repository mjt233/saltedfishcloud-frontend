import { BootLoaderVue } from '@/components/common/BootLoader'
import { BootContextHandler } from './../model/Common'
import { buildApp } from './AppFactory'

const bootApp = buildApp(BootLoaderVue)
const handler = bootApp.mount('#boot-info-container') as any as BootContextHandler
export default handler