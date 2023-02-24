import mongoose from 'mongoose'
import { IUser, IUserMethods, UserModel } from '../interfaces/models/user.interface'
const ObjectId = mongoose.Schema.Types.ObjectId

const UserSchema = new mongoose.Schema<IUser, UserModel, IUserMethods>({
  username: String,
  goals: [{
    type: ObjectId,
    ref: 'Goal',
  }],
  chatId: Number,
  createdAt: Date,
  updatedAt: Date,
})

UserSchema.methods.onCreate = async function (req) {
  const user = await User.findOne({
    chatId: req.body.chatId,
  })
  if (user) {
    throw new Error('User already registered.')
  }
}

UserSchema.methods.onUpdate = function (req) {
  this.updatedAt = new Date()
}
UserSchema.methods.onDelete = function (req) {
  //
}

export const User = mongoose.model<IUser, UserModel>('User', UserSchema)
