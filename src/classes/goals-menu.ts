import { IBtnMarkup } from '../interfaces/classes/goal-btn.interface'
import { IGoal } from '../interfaces/models/goal.interface'
import { TGBtn } from './tg-btn'

export class GoalsMenu {
  private btns: TGBtn[] = []
  private currentPage = 1
  private maxPage = 1

  constructor(goals: IGoal[], currentPage?: number, maxPage?: number) {
    goals.forEach((goal) => {
      const title = goal.title?.length > 50 ? goal.title.substring(0, 50) + '...' : goal.title
      const btn = new TGBtn(title)
      btn.setData(`item_${goal.customID}`)
      this.btns.push(btn)
    })
    if (currentPage) {
      this.currentPage = currentPage
    }
    if (maxPage) {
      this.maxPage = maxPage
    }
  }

  getMarkup() {
    const rows: IBtnMarkup[][] = []
    for (let i = 0; i < this.btns.length; i++) {
      if (i % 2 === 0) {
        rows.push([])
      }
      rows[rows.length - 1].push(this.btns[i].getMarkup())
    }

    const controls: IBtnMarkup[] = []
    if (this.currentPage > 1) {
      const btn = new TGBtn('«')
      btn.setData(`page_${this.currentPage - 1}`)
      controls.push(btn.getMarkup())
    }
    if (this.currentPage < this.maxPage) {
      const btn = new TGBtn('»')
      btn.setData(`page_${this.currentPage + 1}`)
      controls.push(btn.getMarkup())
    }
    if (controls.length > 0) {
      rows.push(controls)
    }

    return {
      reply_markup: {
        inline_keyboard: rows,
      },
    }
  }
}