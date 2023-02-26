export interface IBtnMarkup {
  text: string,
  callback_data?: string
}

export interface IKeyboardMarkup {
  reply_markup: {
    inline_keyboard: IBtnMarkup[][]
  }
}