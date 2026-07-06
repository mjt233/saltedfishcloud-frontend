/**
 * sfc-ext-download 离线下载插件
 *
 * 提供离线下载任务管理功能，包括：
 * - 创建下载任务
 * - 查看下载任务列表
 * - 取消下载任务
 * - 主菜单导航入口
 * - 文件列表快捷操作入口
 */
import { type App } from 'vue'
import type { ToRefs } from 'vue'
import type { AppContext } from 'sfc-common'
import DownloadTaskManager from './components/DownloadTaskManager.vue'
import CreateDownloadForm from './components/CreateDownloadForm.vue'
import { DownloadTaskService } from './components/DownloadTaskService.js'

const bootContext = window.bootContext

/**
 * 注册插件处理器
 */
bootContext.addProcessor({
  taskName: '注册离线下载插件',
  execute(app) {
    // 注册全局组件
    app.component('DownloadTaskManager', DownloadTaskManager)
    app.component('CreateDownloadForm', CreateDownloadForm)

    // 获取系统上下文
    const context = window.getContext()

    // 注册主菜单项 - 下载任务
    const mainMenu = context.menu.value.mainMenu
    const otherGroup = mainMenu.group.find(g => g.id === 'other')
    if (otherGroup) {
      otherGroup.items.push({
        id: 'download-task',
        title: '下载任务',
        route: '/download-task',
        icon: 'mdi-download',
        renderOn: (ctx?: ToRefs<AppContext>) => {
          return ctx?.session?.value?.user != null
        }
      })
    }

    // 注册文件列表顶部按钮 - 离线下载
    const fileBrowserBtn = context.menu.value.fileBrowserBtn
    if (fileBrowserBtn) {
      fileBrowserBtn.push({
        id: 'offline-download',
        name: '离线下载',
        icon: 'mdi-cloud-download',
        renderOn: (ctx) => {
          return ctx != null && !ctx.readonly
        },
        items: [
          {
            id: 'create-download',
            icon: 'mdi-download',
            name: '创建下载任务',
            title: '创建下载任务',
            action: (ctx) => {
              DownloadTaskService.openCreateTask(ctx.uid, ctx.path, true)
            }
          }
        ]
      })
    }

    // 注册路由 - 下载任务管理页面
    const router = context.routeInfo.value.router
    if (router) {
      router.addRoute({
        path: '/download-task',
        component: DownloadTaskManager,
        meta: {
          allowNoLogin: false
        }
      })
    }
  }
})
