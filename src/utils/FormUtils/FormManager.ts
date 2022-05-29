import { CommonForm } from '.'

export class FormManager {
  private forms: {
    [id:string]: CommonForm
  } & Object = {}
  public register(form: CommonForm) {
    this.forms[form.getId()] = form
  }

  public remove(id: string) {
    delete this.forms[id]
  }

  public getForms() {
    return this.forms
  }
}