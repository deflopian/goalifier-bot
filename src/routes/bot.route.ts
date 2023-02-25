import { Request, Response, Router } from 'express'
import { bot } from '../bot'

const router = Router()
const token = process.env.TG_TOKEN || ''

console.log('bots route inited')

router.get('/test', (req: Request, res: Response) => {
  console.log('test request')
  res.json('success')
})

router.post(`/bot${token}`, (req: Request, res: Response) => {
  bot.processUpdate(req.body)
  res.sendStatus(200)
})

export default router
