import { FormManager } from '@/utils/FormUtils/FormManager'

export interface DialogModel {
  formManager: FormManager

  closeLoading(): void

  beginLoading(): void
}