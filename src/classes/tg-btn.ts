import { IBtnMarkup } from '../interfaces/classes/goal-btn.interface'

export class TGBtn {
  private text: string
  private callbackData: string

  constructor(text: string) {
    this.text = text
  }

  setData(data: string) {
    this.callbackData = data
    return this
  }

  getMarkup() {
    const markup: IBtnMarkup = {
      text: this.text,
    }

    if (this.callbackData) {
      markup.callback_data = this.callbackData
    }

    return markup
  }
}