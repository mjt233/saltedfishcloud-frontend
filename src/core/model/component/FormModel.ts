import { ValidateResult } from '@/core/context'
import { ComponentPublicInstance } from 'vue'
export interface TextInputModel extends ComponentPublicInstance {
  validate: () => Promise<ValidateResult>
}