import { Request } from 'express'
import { Document, Model, PopulatedDoc, Types } from 'mongoose'
import { GoalModel } from './goal.interface'

export interface IUser {
  _id: Types.ObjectId
  username: string | null
  goals: (Types.ObjectId | GoalModel)[]
  chatId: number | null
  createdAt: Date
  updatedAt: Date
}

export interface IUserMethods {
  onCreate(req: Request): Promise<void>
  onUpdate(req: Request): void
  onDelete(req: Request): void
}

export type UserModel = Model<IUser, unknown, IUserMethods>