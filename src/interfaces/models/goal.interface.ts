import { Model, Types } from 'mongoose'

export interface IGoal {
  _id: Types.ObjectId
  user: Types.ObjectId
  createdAt: Date
  title: string
  description: string

  from: Date
  till: Date

  achievements: [{
    createdAt: Date
    text: string
    messageId: number
  }]
}

export interface IGoalShort {
  title: string
  description: string
  from: Date,
  till: Date,
}

export interface IGoalMethods {
  isActive(): boolean
  save(): Promise<IGoal>
}

export type GoalModel = Model<IGoal, unknown, IGoalMethods>