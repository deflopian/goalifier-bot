import { Model, ObjectId, Types } from 'mongoose'
import { IUser } from './user.interface'

export interface ITelegramMessage {
  createdAt: Date
  messageId: number
  author: Types.ObjectId | null
  text: string
  linkedCommand: string | null
}

export interface ITelegramChat {
  user: Types.ObjectId | null
  chatId: number
  messages: ITelegramMessage[]
}

export interface ITelegramChatMethods {
  logMessage(messageId: number, text: string, user: IUser | null, command: string | null): void
}

export type TGChatModel = Model<ITelegramChat, unknown, ITelegramChatMethods>