import { TextInputModel } from 'sfc-common/model/component/FormModel'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { DialogModel } from 'sfc-common/model/component/DialogModel'
import { ref, reactive, h, Ref, toRefs, VNode, DefineComponent, ComponentPublicInstance } from 'vue'
import { ChildrenType, DyncComponentHandler, dyncmount } from './DyncMount'
import BaseDialog from 'sfc-common/components/common/BaseDialog.vue'
import SingleFieldForm from 'sfc-common/components/form/SingleFieldForm.vue'
import { ValidateRule } from 'sfc-common/model/component/type'
import { Validators } from 'sfc-common/core/helper/Validators'
import AlertDialog from 'sfc-common/components/common/AlertDialog.vue'
import TextInputVue from 'sfc-common/components/common/TextInput.vue'
import LoginFormVue from 'sfc-common/components/form/LoginForm.vue'
import { CommonForm } from 'sfc-common/utils/FormUtils'
import { Session } from 'sfc-common/core/context/session'
import { context } from 'sfc-common/core/context'
import { BaseForm, LoadingDialog } from 'sfc-common/components'

export interface DialogOpt {
  /**
   * 对话框标题
   */
  title?: string,

  onConfirm(model: DialogModel): Promise<boolean> | boolean,
  onCancel(model: DialogModel): Promise<boolean> | boolean,

  children: ChildrenType,
  extraProps?: DialogProps

  /**
   * 是否全屏显示
   */
  fullscreen?: boolean | 'auto',

  header?: ChildrenType,
  footer?: ChildrenType,
  autoShowError?: boolean

  /**
   * 是否为持久弹框，无法通过ESC或点击外部关闭（默认为false）
   */
  persistent?: boolean

  contentMaxHeight?: string
}

export interface ConfirmOpt {
  /**
   * 额外附加的VNode子节点
   */
  children?: ChildrenType

  /**
   * 当用户点击取消或关闭对话框时是否将Promise敲定为reject
   */
  cancelToReject?: boolean,

  /**
   * 直接插入的HTML字符串
   */
  html?: string
}
export interface DialogHandler {

  /**
   * 关闭对话框（同doCancel）
   */
  close: () => void

  /**
   * 执行确认
   */
  doConfirm: () => void

  /**
   * 执行取消
   */
  doCancel: () => void

  beginLoading(): void

  closeLoading(): void
}
export class DialogPromise extends Promise<void> implements DialogHandler {
  handler!: Ref<DyncComponentHandler<DialogModel>>
  constructor(executor: (resolve: (value: void | PromiseLike<void>) => void, reject: (reason?: any) => void) => void) {
    super(executor)
  }
  beginLoading(): void {
  }
  closeLoading(): void {
  }

  /**
   * 关闭对话框（同doCancel）
   */
  public close() {
    this.doCancel()
  }

  /**
   * 执行确认
   */
  public doConfirm() {

  }

  /**
   * 执行取消
   */
  public doCancel() {

  }

}

/**
 * 快捷输入框参数
 */
export interface PromptOpt {

  /**
   * 对话框标题
   */
  title?: string

  /**
   * 输入框标签
   */
  label?: string,

  /**
   * 默认文本
   */
  defaultValue?: string,

  /**
   * 校验规则
   */
  rules?: ValidateRule[],

  /**
   * 打开对话框后自动聚焦
   */
  autofocus?: boolean

  /**
   * 取消时是否为Reject
   */
  cancelToReject?: boolean
}

/**
 * 弹出对话框
 * @param opt 对话框选项
 */
export function dialog(opt: DialogOpt): DialogPromise {
  const {
    title = null,
    onConfirm = () => true,
    onCancel = () => true,
    children,
    extraProps = {},
    fullscreen = false,
    header = undefined,
    footer = undefined,
    persistent = false,
    autoShowError = false
  } = opt

  const finalUseFullScreen = fullscreen == true || (fullscreen == 'auto' && document.documentElement.clientWidth <= 640)
  if (finalUseFullScreen) {
    extraProps.maxWidth = '99999px'
    extraProps.width = '100vw'
  }
  let vueInst = ref() as Ref<DyncComponentHandler<DialogModel>>
  let close: () => void
  // 构造组件参数
  const attrs = reactive({
    // 对话框显示控制
    modelValue: true,
    fullscreen: finalUseFullScreen,
    title,
    persistent,
    contentMaxHeight: opt.contentMaxHeight,
    async 'onUpdate:modelValue'(e: any) {
      attrs.modelValue = e
      if (!e) {
        if(await onCancel(ret.handler.value.getComponentInst())) {
          close()
        }
      }
    },
    // 对话框确认
    async onConfirm() {
      try {
        if(await onConfirm(vueInst.value.getComponentInst())) {
          attrs.modelValue = false
          if(await onCancel(ret.handler.value.getComponentInst())) {
            close()
          }
        }
      } catch(err) {
        console.error(err)
        if (autoShowError) {
          SfcUtils.snackbar(err, 1500, {outClose: true})
        }
      }
    },

    // 对话框取消
    async onCancel() {
      if (await onCancel(vueInst.value.getComponentInst())) {
        attrs.modelValue = false
        setTimeout(vueInst.value.unmount, 120)
      }
    },
    ...extraProps
  })

  const ret = new DialogPromise((resolve, reject) => {
    close = () => {
      resolve()
      setTimeout(vueInst.value.unmount, 120)
    }
    
    // 动态创建组件并挂载
    vueInst.value = dyncmount<DialogModel>(BaseDialog, {
      props: attrs,
      children: {
        default: children,
        actions: footer,
        header: header
      }
    })
  })
  ret.doConfirm = attrs.onConfirm
  ret.doCancel = attrs.onCancel
  ret.close = attrs.onCancel
  ret.handler = vueInst
  ret.closeLoading = vueInst.value.getComponentInst().closeLoading
  ret.beginLoading = vueInst.value.getComponentInst().beginLoading
  return ret
}

export interface DialogProps {
  /**
   * 是否显示确认按钮
   */
  showConfirm?: boolean

  /**
   * 是否显示取消按钮
   */
  showCancel?: boolean

  /**
   * 标题
   */
  title?: string

  /**
   * 宽度（默认90%）
   */
  width?: string

  /**
   * 是否持久显示
   */
  persistent?: boolean

  /**
   * 隐藏默认按钮
   */
  hideBtn?: boolean

  /**
   * 最大宽度（默认：640px）
   */
  maxWidth?: string

  /**
   * 是否全屏显示
   */
  fullscreen?: boolean

  /**
   * 是否紧凑布局
   */
  dense?: boolean

  /**
   * 是否使用卡片样式
   */
  useCard?: boolean

  [other: string]: any
}

export interface OpenComponentDialogOption {
  props?: any
  showConfirm?: boolean
  showCancel?: boolean
  onConfirm?: () => boolean | Promise<boolean>
  onCancel?: () => boolean | Promise<boolean>
  title?: string
  dense?: boolean
  extraDialogOptions?: DialogProps
  header?: ChildrenType
  footer?: ChildrenType
  fullscreen?: boolean | 'auto'
  persistent?: boolean

  /** 在onConfirm和onCancel抛出异常时是否气泡显示错误 */
  autoShowError?: boolean

  // 是否使用一个div对组件进行包装
  inWrap?: boolean

  contentMaxHeight?: string

}

export interface ComponentDialogInstance {
  /**
   * 获取挂载的组件实例
   */
  getComponentInstRef: () => ComponentPublicInstance

  /**
   * 获取挂载的表单组件实例
   */
  getInstAsForm: () => CommonForm
}

export function openComponentDialog(component: any, opt?: OpenComponentDialogOption): DialogPromise & ComponentDialogInstance {
  const {
    dense = false,
    props = {},
    showConfirm = true,
    showCancel = true,
    onConfirm = () => true,
    onCancel = () => true,
    title = '',
    extraDialogOptions = {},
    header,
    footer,
    fullscreen = 'auto',
    persistent,
    autoShowError = false
  } = opt || {}
  props.ref = 'component'
  const dialogPromise = dialog({
    children: () => h(component, props),
    onConfirm,
    onCancel,
    title,
    header,
    footer,
    fullscreen,
    persistent,
    autoShowError,
    contentMaxHeight: opt?.contentMaxHeight,
    extraProps: {
      dense,
      showCancel,
      showConfirm,
      ...extraDialogOptions
    }
  })

  const dialogInst = dialogPromise.handler.value.getComponentInst()

  return {
    ...dialogPromise,
    getComponentInstRef() {
      return (dialogPromise.handler.value.getRoot().$refs.component) as ComponentPublicInstance
    },
    getInstAsForm() {
      return this.getComponentInstRef() as any as CommonForm
    },
    doConfirm: dialogPromise.doConfirm.bind(dialogPromise),
    doCancel: dialogPromise.doCancel.bind(dialogPromise),
    close: dialogPromise.close.bind(dialogPromise),
    beginLoading: dialogInst.beginLoading,
    closeLoading: dialogInst.closeLoading
  }
}


export interface LoadingDialogParam {
  /** 加载框提示语 */
  msg?: string
}

/**
 * 打开一个加载对话框
 * @param param 加载对话框参数
 */
export function loadingDialog(param?: LoadingDialogParam) {
  return SfcUtils.openComponentDialog(LoadingDialog, {
    title: '',
    props: param,
    extraDialogOptions: {
      hideBtn: true,
      width: '280px !important',
    },
    fullscreen: false,
    persistent: true
  })
}


/**
 * 弹出输入提示框
 * @param opt 选项
 */
export function prompt(opt: PromptOpt): Promise<string> {
  const { rules = [Validators.notNull('不能为空')], title = '数据输入', label = '请输入数据', defaultValue = '', autofocus = true, cancelToReject = false } = opt
  const val = ref(defaultValue)
  return new Promise((resolve, reject) => {
    const inst = openComponentDialog(TextInputVue, {
      fullscreen: false,
      props: reactive({
        modelValue: val,
        rules,
        label,
        'onUpdate:modelValue'(e: string) {
          val.value = e
        },
        autofocus,
        async onEnter() {
          const result = await (inst.getComponentInstRef() as TextInputModel).validate()
          if(result.valid) {
            inst.doConfirm()
          } else {
            SfcUtils.snackbar(result.errors.map(e => e.errorMessages).join(','))
          }
        },
      }),
      onConfirm() {
        resolve(val.value)
        return true
      },
      onCancel() {
        if (cancelToReject) {
          reject('cancel')
        }
        return true
      },
      title
    })
  })
}

/**
 * 弹出提示框
 * @param message 消息
 * @param title 标题
 */
export function alert(message: string, title: string = '提示') {
  let inst: DyncComponentHandler<any>
  return new Promise<void>((resolve, reject) => {
    const attrs = reactive({
      message,
      title,
      modelValue: true,
      'onUpdate:modelValue'() {
        attrs.modelValue = false
        resolve()
        setTimeout(() => {
          inst.unmount()
        }, 200)
      },
      hideBtn: true,
      persistent: true
    })
    inst = dyncmount(AlertDialog, {
      props: attrs
    })
  })
}
/**
 * 打开一个确认对话框
 * @param message 提示的消息内容
 * @param title 对话框标题
 * @param opt 其他选项
 */
export function confirm(message: string, title: string, opt: ConfirmOpt = {}) :Promise<void> {
  const { children = [], cancelToReject = false, html = '' } = opt
  let isConfirm = false
  return new Promise((resolve, reject) => {
    dialog({
      fullscreen: false,
      children: () => {
        // 默认的纯文本消息
        const renderArr: any[] = [
          h('div', [
            message
          ])
        ]

        // 附加的子VNode
        if (children instanceof Array) {
          (children as any[]).forEach(e => renderArr.push(e))
        } else {
          renderArr.push(children)
        }

        // 附加的HTML渲染
        if (html) {
          renderArr.push(h('div', {
            'innerHTML': html
          }))
        }
        return renderArr
      },
      title: title,
      onConfirm: () => {
        isConfirm = true
        resolve()
        return true
      },
      onCancel: () => {
        if (cancelToReject) {
          reject('cancel')
        }
        return true
      }
    }).then(() => {
      if (!isConfirm && cancelToReject) {
        reject('cancel')
      }
    })
  })

}

/**
 * 打开登录对话框，用于快捷登录
 */
export function openLoginDialog(): Promise<Session> {
  return new Promise((resolve, reject) => {
    const inst = openComponentDialog(LoginFormVue, {
      title: '登录',
      props: {
        plain: true,
        onSubmit() {
          inst.doConfirm()
        }
      },
      async onConfirm() {
        const ret = await (inst.getComponentInstRef() as any as CommonForm).submit()
        if (ret.success) {
          resolve(context.session.value)
          return true
        } else {
          SfcUtils.snackbar(ret.err)
          reject(ret.err)
          return false
        }
      }
    })
  })
}