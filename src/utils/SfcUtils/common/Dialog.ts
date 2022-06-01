import SfcUtils from '@/utils/SfcUtils'
import { DialogModel } from '@/core/model/component/DialogModel'
import { ref, reactive, h, Ref, toRefs } from 'vue'
import { DyncComponentHandler, dyncmount } from './DyncMount'
import BaseDialog from '@/components/common/BaseDialog.vue'
import SingleFieldForm from '@/components/form/SingleFieldForm.vue'
import { ValidateRule } from '@/core/model/component/type'
import { Validators } from '@/core/helper/Validators'

export interface DialogOpt {
  /**
   * 对话框标题
   */
  title?: string,

  onConfirm(model: DialogModel): Promise<boolean> | boolean,
  onCancel(model: DialogModel): Promise<boolean> | boolean,

  children?: Array<any> | string | Function,
  extraProps?: any
}

export class DialogPromise extends Promise<void> {
  handler!: Ref<DyncComponentHandler<DialogModel>>
  constructor(executor: (resolve: (value: void | PromiseLike<void>) => void, reject: (reason?: any) => void) => void) {
    super(executor)
  }

  close() {

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
}

export function dialog(opt: DialogOpt) {
  const {
    title = '对话框',
    onConfirm = () => true,
    onCancel = () => true,
    children,
    extraProps = {}
  } = opt
  let vueInst = ref() as Ref<DyncComponentHandler<DialogModel>>
  const ret = new DialogPromise((resolve, reject) => {
    const close = () => {
      resolve()
      setTimeout(vueInst.value.unmount, 120)
    }
    // 构造组件参数
    const attrs = reactive({
      // 对话框显示控制
      modelValue: true,
      'onUpdate:modelValue'(e: any) {
        attrs.modelValue = e
        if (!e) {
          close()
        }
      },
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

    // 动态创建组件并挂载
    vueInst.value = dyncmount<DialogModel>(BaseDialog, attrs, children)
  })
  ret.handler = vueInst
  return ret
}

export function prompt(opt: PromptOpt): Promise<string> {
  const { rules = [Validators.notNull('不能为空')], title = '数据输入', label = '请输入数据', defaultValue = '', autofocus = true } = opt
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
            return Promise.reject('校验失败：' + result.errorMessages[0].errorMessages)
          }
        }
        resolve(formValue.value)
        return true
      },
      onCancel() {
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