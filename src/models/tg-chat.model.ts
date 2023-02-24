import { ITelegramChat, ITelegramMessage, ITelegramChatMethods, TGChatModel } from '../interfaces/models/telegram.interface'
import mongoose from 'mongoose'
import { IUser } from '../interfaces/models/user.interface'

const ObjectId = mongoose.Schema.Types.ObjectId

const TGMessage = new mongoose.Schema<ITelegramMessage>({
  messageId: {
    type: Number,
    default: 0,
  },
  author: {
    type: ObjectId,
    default: null,
  },
  text: {
    type: String,
    default: '',
  },
  linkedCommand: {
    type: String,
    default: null,
  },
  createdAt: Date,
})

const TGChatSchema = new mongoose.Schema<ITelegramChat, TGChatModel, ITelegramChatMethods>({
  user: {
    type: ObjectId,
    ref: 'User',
    default: null,
  },
  chatId: {
    type: Number,
    default: 0,
  },
  messages: [TGMessage],
})

TGChatSchema.methods.logMessage = function (messageId: number, text: string, user: IUser | null, command: string | null) {
  const message: ITelegramMessage = {
    messageId,
    text,
    author: user ? user._id : null,
    createdAt: new Date(),
    linkedCommand: command || null,
  }

  this.messages.push(message)
}

export const TGChat = mongoose.model<ITelegramChat, TGChatModel>('TGChat', TGChatSchema)
