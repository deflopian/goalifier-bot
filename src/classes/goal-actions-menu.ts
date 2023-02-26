import { IBtnMarkup, IKeyboardMarkup } from '../interfaces/classes/goal-btn.interface'
import Languages from '../utils/languages.enum'
import { IGoal } from '../interfaces/models/goal.interface'
import { TGBtn } from './tg-btn'
import messages from '../utils/tg-messages.enum'
import L10nTypes from '../utils/l10n-types.enum'

export class GoalActionsMenu {
  private btns: TGBtn[]

  constructor(goal: IGoal, lang: Languages) {
    this.btns.push((new TGBtn(messages[lang][L10nTypes.MENU_GOAL_EDIT])).setData(`goals_actions_edit_${goal.customID}`))
    this.btns.push((new TGBtn(messages[lang][L10nTypes.MENU_GOAL_DELETE])).setData(`goals_actions_delete_${goal.customID}`))
    this.btns.push((new TGBtn(messages[lang][L10nTypes.MENU_GOAL_ACHIEVEMENTS])).setData(`goals_actions_achievements_${goal.customID}`))
    this.btns.push((new TGBtn(messages[lang][L10nTypes.MENU_GOAL_ADD_ACHIEVEMENT])).setData(`goals_actions_add_achievement_${goal.customID}`))
    this.btns.push((new TGBtn(messages[lang][L10nTypes.MENU_GOAL_CANCEL])).setData(`goals_actions_cancel_${goal.customID}`))
  }

  getMarkup(): IKeyboardMarkup {
    const rows: IBtnMarkup[][] = []
    for (let i = 0; i < this.btns.length; i++) {
      if (i % 2 === 0) {
        rows.push([])
      }
      rows[rows.length - 1].push(this.btns[i].getMarkup())
    }

    return {
      reply_markup: {
        inline_keyboard: rows,
      },
    }
  }
}