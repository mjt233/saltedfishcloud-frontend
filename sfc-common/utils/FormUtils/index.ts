import { ValidateResult } from 'sfc-common/core/context'
import { reactive, Ref } from 'vue'
import SfcUtils from '../SfcUtils'
import { MethodInterceptor, LoadingManager, StringUtils } from 'sfc-common/utils'
import { FormManager } from './FormManager'
import { ValidateRule } from 'sfc-common/model/component/type'
import { AxiosResponse } from 'axios'
export type FormFieldType = string | boolean | number
export type ValidatorFunction = (val: FormFieldType) => boolean | Promise<boolean> | string | Promise<string>
export { FormManager } from './FormManager'
export interface FormValidators  { 
  [ name:string ]: ValidatorFunction[] | ValidateRule[]
}
/**
 * 通用表单常用的属性的构造选项
 */
export interface CommonFormAttConstructOpt<V extends FormValidators, F extends object, A extends object> {
  validators: V,
  formData: F,
  actions: A
}

export interface CommonFormAttExtraConstructOpt {
  /** actions出错时是否抛出错误，默认为true */
  throwError?: boolean,

  /**
   * BaseForm引用实例
   */
  formRef: Ref<any>
}

export interface CommonFormAtt<V extends FormValidators, F extends object, A extends object> extends CommonFormAttConstructOpt<V, F, A> {
  loadingManager: LoadingManager,
  loadingRef: Ref<boolean>
}

/**
 * 用于构造通用表单实例的参数选项
 */
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
  submitAction: () => Promise<any> | null | undefined | void,

  formManager: FormManager,

  loadingManager?: LoadingManager
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
  submit: (opt?: SubmitOpt) => Promise<FormSubmitResult>,

  /**
   * 获取该表单的唯一标识符
   */
  getId: () => string

  getFormManager: () => FormManager

  getFormLoadingManager: () => LoadingManager

  getFormLoadingRef: () => Ref<boolean>
}

/**
 * 从BaseForm表组组件实例Ref引用中单独暴露出方法，以便进行解构赋值和对象属性打散合并操作
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
    },
    getId() {
      return form.value.getId()
    },
    getFormManager() {
      return form.value.getFormManager()
    },
    getFormLoadingManager() {
      return form.value.getFormLoadingManager()
    },
    getFormLoadingRef() {
      return form.value.getFormLoadingRef()
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
  data?: AxiosResponse
}

/**
 * 声明一个支持子表单的标准表单
 * @param opt 表单选项
 * @returns 标准表单方法对象
 */
export function defineBaseForm(opt: CommonFormOpt): CommonForm {
  const id = StringUtils.getRandomStr(32)
  const loadingManager = opt.loadingManager || new LoadingManager()
  return MethodInterceptor.createAutoLoadingProxy({
    getFormLoadingManager() {
      return loadingManager
    },
    getFormLoadingRef() {
      return loadingManager.getLoadingRef()
    },
    getFormManager() {
      return opt.formManager
    },
    getId() {
      return id
    },
    getFormData() {
      const formData = {}
      if(opt.sonForm != null) {
        opt.sonForm.filter(e => e.value).forEach(sonForm => {
          Object.assign(formData, sonForm.value.getFormData())
        })
      }
      Object.assign(formData, opt.formData)
      return formData
    },
    async validate() {
      // 校验结果
      const result: ValidateResult = { valid: true, errors: [] }

      // 待校验的表单
      const validForms: CommonForm[] = []
      if (opt.sonForm != null && opt.sonForm.length > 0) {
        opt.sonForm.forEach(e => validForms.push(e.value))
      }
      validForms.push(opt.formRef.value)

      // 对子表单和本表单进行校验
      for (const formInst of validForms) {
        if (formInst == null) {
          continue
        }
        const tempRes = await formInst.validate()
        if (!tempRes.valid) {
          result.valid = false
          tempRes.errors.forEach(e => result.errors.push(e))
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
        if (!ignoreValidate) {
          const validResult = await this.validate()
          if (!validResult.valid) {
            const errorMessage = validResult.errors.map(e => e.errorMessages).join(';')
            throw new Error(errorMessage)
          }
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
            SfcUtils.snackbar(err.msg || err.toString())
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
  }, loadingManager)
}

/**
 * 定义一个常用标准表单
 * @param opt 表单构建选项
 */
export function defineForm<V extends FormValidators, F extends object, A extends object>(opt: CommonFormAttConstructOpt<V , F, A> & CommonFormAttExtraConstructOpt): CommonFormAtt<V , F, A> & CommonForm {
  const manager = new LoadingManager()
  const { throwError = true } = opt
  return {
    actions: MethodInterceptor.createAsyncActionProxy(opt.actions, throwError, manager),
    formData: reactive(opt.formData) as F,
    loadingManager: manager,
    loadingRef: manager.getLoadingRef(),
    validators: opt.validators,
    ...deconstructForm(opt.formRef)
  }
}