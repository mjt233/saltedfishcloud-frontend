import API from '@/api'
import { CreateMountPointFormVue } from '@/components/common/MountPoint'
import { MenuGroup } from '@/core/context'
import { Validators } from '@/core/helper/Validators'
import { FileListContext } from '@/core/model'
import { ValidateRule } from '@/core/model/component/type'
import SfcUtils from '@/utils/SfcUtils'

export default {
  id: 'create',
  name: '添加',
  icon: 'mdi-plus',
  renderOn(ctx) {
    return ctx != undefined && !ctx.readonly
  },
  items: [
    {
      id: 'upload-file',
      title: '上传文件',
      icon: 'mdi-upload',
      action(ctx) {
        ctx.modelHandler.upload()
      }
    },
    {
      id: 'mkdir',
      title: '新建文件夹',
      icon: 'mdi-folder-plus',
      async action(ctx) {
        // 定义校验器，不允许为空，不允许重名
        const rules: ValidateRule[] = [
          Validators.notNull('文件夹名称不能为空'),
          (e: string) => {
            if(ctx.fileList.find(file => file.name == e)) {
              return '文件名重复'
            } else {
              return true
            }
          }
        ]

        // 构造默认文件名，重名编号自动加1
        let sameCount = 1
        let defaultName = '新建文件夹'
        ctx.fileList.forEach(file => {
          if (file.name == defaultName) {
            sameCount++
          }
          if (sameCount > 1) {
            defaultName = `新建文件夹(${sameCount})`
          }
        })

        // 打开输入对话框
        try {

          const name = await SfcUtils.prompt({
            title: '新建文件夹',
            label: '文件夹名称',
            rules,
            defaultValue: defaultName,
            cancelToReject: true
          })
          await ctx.modelHandler.mkdir(name)
          await ctx.modelHandler.refresh()
        } catch(err) {
          if (err == 'cancel') {
            return
          } else {
            return Promise.reject(err)
          }
        }
      }
    },
    {
      id: 'empty-file',
      title: '创建空文件',
      icon: 'mdi-file-plus',
      renderOn(ctx) {
        return !ctx.readonly
      },
      action(ctx) {
        const createEmptyFile = (defaultName?: string) => {
          SfcUtils.prompt({
            title: '创建文件',
            autofocus: true,
            label: '请输入文件名',
            defaultValue: defaultName
          }).then(async(fileName) => {
            try {
              if (!fileName) {
                throw new Error('文件名不能为空')
              }
              if(ctx.fileList.findIndex(e => e.name == fileName) != -1) {
                throw new Error('文件名已存在')
              }
              SfcUtils.beginLoading()
              await SfcUtils.request(API.file.upload(ctx.uid, ctx.path, new File([new Blob([''])], fileName)))
              SfcUtils.snackbar('创建成功')
              ctx.modelHandler.refresh()
            } catch(err) {
              SfcUtils.snackbar(err)
              createEmptyFile(fileName)
            } finally {
              SfcUtils.closeLoading()
            }
          })
        }
        createEmptyFile()
      }
    },
    {
      id: 'mount',
      title: '云挂载目录',
      icon: 'mdi-cloud',
      renderOn(ctx) {
        return !ctx.readonly
      },
      action(ctx) {
        const form = SfcUtils.openComponentDialog(CreateMountPointFormVue, {
          title: '创建挂载点',
          props: {
            uid: ctx.uid
          },
          async onConfirm() {
            const res = await form.getInstAsForm().submit()
            if(res.success) {
              ctx.modelHandler.refresh()
              return true
            } else {
              return false
            }
            
          }
        })
      },
    }
  ]
} as MenuGroup<FileListContext>