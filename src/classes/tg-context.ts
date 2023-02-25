import { IGoal } from '../interfaces/models/goal.interface'
import TGContextTypes from '../utils/tg-context-types.enum'

export class TGContext {
  contextByChat: object
  goalByChat: object

  constructor () {
    this.contextByChat = {}
    this.goalByChat = {}
  }

  setContext (chatId: number, context: TGContextTypes): void {
    this.contextByChat[chatId] = context
  }

  getContext(chatId: number): TGContextTypes | null {
    return this.contextByChat[chatId] || null
  }

  clearContext(chatId: number): void {
    this.contextByChat[chatId] = null
  }

  setActiveGoal (chatId: number, goal: IGoal): void {
    this.goalByChat[chatId] = goal
  }

  getActiveGoal(chatId: number): IGoal | null {
    return this.goalByChat[chatId] || null
  }

  clearActiveGoal(chatId: number): void {
    this.goalByChat[chatId] = null
  }

  is (chatId: number, context: TGContextTypes | null) {
    return this.contextByChat[chatId] === context
  }
}