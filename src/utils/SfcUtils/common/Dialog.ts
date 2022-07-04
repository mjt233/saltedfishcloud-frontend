import SfcUtils from '@/utils/SfcUtils'
import { DialogModel } from '@/core/model/component/DialogModel'
import { ref, reactive, h, Ref, toRefs, VNode, DefineComponent } from 'vue'
import { DyncComponentHandler, dyncmount } from './DyncMount'
import BaseDialog from '@/components/common/BaseDialog.vue'
import SingleFieldForm from '@/components/form/SingleFieldForm.vue'
import { ValidateRule } from '@/core/model/component/type'
import { Validators } from '@/core/helper/Validators'
import AlertDialog from '@/components/common/AlertDialog.vue'

export interface DialogOpt {
  /**
   * 对话框标题
   */
  title?: string,

  onConfirm(model: DialogModel): Promise<boolean> | boolean,
  onCancel(model: DialogModel): Promise<boolean> | boolean,

  children?: VNode | Array<any> | string | Function,
  extraProps?: any

  /**
   * 是否全屏显示
   */
  fullscreen?: boolean
}

export interface ConfirmOpt {
  /**
   * 额外附加的VNode子节点
   */
  children?: VNode | Array<any> | string | Function

  /**
   * 当用户点击取消或关闭对话框时是否将Promise敲定为reject
   */
  cancelToReject?: boolean,

  /**
   * 直接插入的HTML字符串
   */
  html?: string
}

export class DialogPromise extends Promise<void> {
  handler!: Ref<DyncComponentHandler<DialogModel>>
  constructor(executor: (resolve: (value: void | PromiseLike<void>) => void, reject: (reason?: any) => void) => void) {
    super(executor)
  }

  /**
   * 关闭对话框（同doCancel）
   */
  close() {
    this.doCancel()
  }

  /**
   * 执行确认
   */
  doConfirm() {

  }

  /**
   * 执行取消
   */
  doCancel() {

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
export function dialog(opt: DialogOpt) {
  const {
    title = '对话框',
    onConfirm = () => true,
    onCancel = () => true,
    children,
    extraProps = {},
    fullscreen = false
  } = opt
  if (fullscreen) {
    extraProps.maxWidth = '99999px'
  }
  let vueInst = ref() as Ref<DyncComponentHandler<DialogModel>>
  let close: () => void

  // 构造组件参数
  const attrs = reactive({
    // 对话框显示控制
    modelValue: true,
    async 'onUpdate:modelValue'(e: any) {
      attrs.modelValue = e
      if (!e) {
        if(await onCancel(ret.handler.value.getComponentInst())) {
          close()
        }
      }
    },
    fullscreen,
    title,
    // 对话框确认
    async onConfirm() {
      try {
        if(await onConfirm(vueInst.value.getComponentInst())) {
          attrs.modelValue = false
        }
      } catch(err) {
        SfcUtils.snackbar(err, 1500, {outClose: true})
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
    vueInst.value = dyncmount<DialogModel>(BaseDialog, attrs, children)
  })
  ret.doConfirm = attrs.onConfirm
  ret.doCancel = attrs.onCancel
  ret.close = attrs.onCancel
  ret.handler = vueInst
  return ret
}

/**
 * 弹出输入提示框
 * @param opt 选项
 */
export function prompt(opt: PromptOpt): Promise<string> {
  const { rules = [Validators.notNull('不能为空')], title = '数据输入', label = '请输入数据', defaultValue = '', autofocus = true, cancelToReject = false } = opt
  const formValue = reactive({
    value: defaultValue
  })
  return new Promise((resolve, reject) => {
    const dialogPromise = dialog({
      title,
      async onConfirm(e) {
  
        const forms = e.formManager.getForms()
        const ids = Object.keys(forms)
  
        // 对对话框内的所有表单执行校验
        for (const id of ids) {
          const form = forms[id]
          const result = (await form.validate())
          if (!result.valid) {
            return Promise.reject('校验失败：' + result.errors[0].errorMessages)
          }
        }
        resolve(formValue.value)
        return true
      },
      onCancel() {
        if (cancelToReject) {
          reject('cancel')
        }
        return true
      },
      children: () => [
        h(SingleFieldForm, {
          modelValue: formValue,
          rules,
          label,
          'onUpdate:modelValue'(e: {value: string}) {
            formValue.value = e.value
          },
          autofocus,
          onEnter() {
            dialogPromise.handler.value.getComponentInst().$emit('confirm')
          },
          ref: 'inputForm'
        })
      ]
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
    inst = dyncmount(AlertDialog, attrs)
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