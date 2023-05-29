import { FormManager } from 'sfc-common/utils/FormUtils/FormManager'

export interface DialogModel {
  formManager: FormManager

  closeLoading(): void

  beginLoading(): void
}