import { ValidateResult } from '@/core/context'
import { Ref } from 'vue'

export interface CommonFormOpt {
  /**
   * vuetify表单组件引用实例
   */
  formRef: Ref<CommonForm>,

  /**
   * 表单数据对象
   */
  formData: Object,

  sonForm?: Ref<CommonForm>[],

  /**
   * 执行提交的方法
   */
  submitAction: () => Promise<any> | null | undefined
}

export interface CommonForm {
  /**
   * 执行表单校验，若存在子表单，则会连同子表单一起校验
   */
  validate: () => Promise<ValidateResult>,
  
  /**
   * 表单数据，若存在子表单，则会合并子表单的数据
   */
  getFormData: () => any,

  /**
   * 执行表单提交
   * @param ignoreValidate 是否跳过校验
   */
  submit: (ignoreValidate?: boolean) => Promise<any>
}

/**
 * 解构Form
 * @param form baseForm实例
 * @returns 
 */
export function deconstructForm(form: Ref<any>): CommonForm {
  return {
    getFormData() {
      return form.value.getFormData()
    },
    async submit() {
      return await form.value.submit()
    },
    async validate() {
      return await form.value.validate()
    } 
  }
}

/**
 * 声明一个支持子表单的标准表单
 * @param opt 表单选项
 * @returns 标准表单方法对象
 */
export function defineForm(opt: CommonFormOpt): CommonForm {
  return {
    getFormData() {
      const formData = {}
      if(opt.sonForm != null) {
        opt.sonForm.forEach(sonForm => {
          Object.assign(formData, sonForm.value.getFormData())
        })
      }
      Object.assign(formData, opt.formData)
      return formData
    },
    async validate() {
      // 校验结果
      const result: ValidateResult = { valid: true, errorMessages: [] }

      // 待校验的表单
      const validForms: CommonForm[] = []
      if (opt.sonForm != null && opt.sonForm.length > 0) {
        opt.sonForm.forEach(e => validForms.push(e.value))
      }
      validForms.push(opt.formRef.value)

      // 对子表单和本表单进行校验
      for (const formInst of validForms) {
        const tempRes = await formInst.validate()
        if (!tempRes.valid) {
          result.valid = false
          tempRes.errorMessages.forEach(e => result.errorMessages.push(e))
        }
      }
      return result
    },
    async submit(ignoreValidate = false) {
      if (!ignoreValidate && !(await this.validate()).valid) {
        throw new Error('表单校验不通过')
      }
      return opt.submitAction()
    }
  }
}