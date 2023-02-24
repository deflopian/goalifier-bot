import { Request, Response, Router } from 'express'
import { bot } from '../bot'

const router = Router()
const token = process.env.TG_TOKEN || ''

router.post(`/bot${token}`, (req: Request, res: Response) => {
  bot.processUpdate(req.body)
  res.sendStatus(200)
})

export default router
