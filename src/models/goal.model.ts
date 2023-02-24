import { IGoal, IGoalMethods, GoalModel } from '../interfaces/models/goal.interface'
import mongoose from 'mongoose'

const ObjectId = mongoose.Schema.Types.ObjectId

const GoalSchema = new mongoose.Schema<IGoal, GoalModel, IGoalMethods>({
  user: {
    type: ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
  from: {
    type: Date,
    required: true,
  },
  till: {
    type: Date,
    required: true,
  },
  title: {
    type: String,
  },
  description: {
    type: String,
    default: '',
  },
  achievements: [{
    createdAt: Date,
    text: {
      type: String,
      default: '',
    },
    messageId: {
      type: Number,
      default: null,
    },
  }],
})

GoalSchema.statics.getAccessFields = function () {
  return ['user']
}

GoalSchema.methods.isActive = function () {
  let isValid = false
  const now = new Date()
  isValid = this.from <= now && this.till >= now

  return isValid
}

export const Goal = mongoose.model<IGoal, GoalModel>('Goal', GoalSchema)
