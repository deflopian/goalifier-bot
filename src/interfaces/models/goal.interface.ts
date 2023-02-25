import { Schema, model,Document, Model, Types } from 'mongoose'

export interface IGoal extends Document {
  user: Types.ObjectId
  createdAt: Date
  title: string
  description: string
  customID: string

  from: Date
  till: Date

  achievements: [{
    createdAt: Date
    text: string
    messageId: number
  }]
}

export interface GoalModel extends Model<IGoal> {
  save(): Promise<GoalModel>
  isActive(): boolean
}