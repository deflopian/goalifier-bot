import { Router } from 'express'
import { logger } from '../utils/logger.helper'

const router = Router()

import bots from './bot.route'

router.use('/api/bots', bots)

router.use((error, req, res, next) => {
  console.log('error')
  console.log(error)
  const trace = error.stack.split('\n').slice(0,4).join('\n')
  logger.error(`"${error.message}" \n\tURL: ${req.originalUrl} \n\tTrace: ${trace}`)

  // при серверных ошибок незачем информировать пользователя о тонкостях работы сервера
  const message = error.status ? error.message : 'Server error'

  res
    .status(error.status || 500)
    .json({ message })
})

export default router
