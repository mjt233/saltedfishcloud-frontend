import { ToRefs } from 'vue'
import { AppContext } from '../context/type'
export namespace ConditionFunction {
  export function hasLogin(ctx: ToRefs<AppContext>)  {
    const token = ctx.session.value.token
    return token != null && token != ''
  }

  export function noLogin(ctx: ToRefs<AppContext>) {
    return !hasLogin(ctx)
  }
}