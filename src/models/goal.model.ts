import { IGoal, GoalModel } from '../interfaces/models/goal.interface'
import { Schema, model } from 'mongoose'

const ObjectId = Schema.Types.ObjectId

const GoalSchema: Schema<IGoal> = new Schema({
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
  customID: {
    type: String,
    default: null,
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

export const Goal = model<IGoal, GoalModel>('Goal', GoalSchema)
