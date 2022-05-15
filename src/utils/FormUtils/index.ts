import { ValidateResult } from '@/core/context'
import { Ref } from 'vue'
import SfcUtils from '../SfcUtils'

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

export interface SubmitOpt {
  /**
   * 是否跳过表单校验
   */
  ignoreValidate?: boolean,

  /**
   * 当表单提交时出现异常时会执行该函数。
   * 未提供该属性时，表单提交异常 且 popError为true时，会直接导致submit方法异常。
   * 若该函数执行完毕未出现异常，则submit方法则视为无异常。
   * 若该函数继续错误或抛出异常，则submit方法也会跟着抛出异常。
   */
  errorHandler?: ((...e: any) => Promise<any> | undefined | null) | null,

  /**
   * 当未提供errorHandler时，出现错误是否弹出错误信息。默认为true
   */
  showError?: boolean,

  /**
   * 出现未能处理的异常是否在submit中继续向上抛出
   */
  popError?: boolean
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
   * @param opt 提交执行选项
   */
  submit: (opt?: SubmitOpt) => Promise<FormSubmitResult>
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

export interface FormSubmitResult {
  /**
   * 表单提交是否成功
   */
  success: boolean,
  
  /**
   * 表单提交错误信息对象
   */
  err?: Error,

  /**
   * 表单提交后获得的数据
   */
  data?: any
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
    async submit(submitOpt) {
      const { ignoreValidate = false, errorHandler = null, showError = true, popError = false } = submitOpt || {}

      const submitResult: FormSubmitResult = {
        success: true
      }
      try {
        if (!ignoreValidate && !(await this.validate()).valid) {
          throw new Error('表单校验不通过')
        }
        submitResult.data = await opt.submitAction()
        return submitResult
      } catch(err: any) {
        if (errorHandler) {
          submitResult.data = await errorHandler(err)
          return submitResult
        } else {
          submitResult.success = false
          if (showError) {
            let msg
            if (err instanceof Error) {
              msg = err.message
              console.log(err)
            } else {
              msg = err.toString()
            }
            SfcUtils.snackbar(msg)
          }
          if (popError) {
            throw err
          } else {
            submitResult.err = err
          }
          return submitResult
        }
      }
    }
  }
}