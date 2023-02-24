import mongoose, { ConnectOptions } from 'mongoose'
import express from 'express'
import cors from 'cors'
import { logger } from './utils/logger.helper'
import routes from './routes'

const app = express()

const authSource: string = process.env.MONGO_AUTH_SOURCE || 'admin'
const connectionUri: string = process.env.MONGO_CONNECTION || ''
const connectionOptions: ConnectOptions = {
  authSource: authSource,
}

// connect to mongodb
mongoose
  .connect(connectionUri, connectionOptions)
  .then(() => console.log('Connected to MongoDB...'))
  .catch((error) => {
    console.error('Could not connect to MongoDB... ' + error.message)
  })

app.use(express.static('assets'))
app.disable('x-powered-by')
app.use(express.json())
app.use((req, res, next) => {
  logger.info(`${req.method}:${req.originalUrl}; IP: ${req.ip}`)
  next()
})
app.use(cors({
  allowedHeaders: [ 'Authorization', 'Content-Type', 'Content-Disposition' ],
  exposedHeaders: [ 'Authorization', 'Content-Disposition' ],
}))
app.use('/', routes)

app.use((err, req, res, next) => {
  if (err.code === 'INCORRECT_FILETYPE') {
    res.status(422).json({ message: 'Можно загружать только изображения' })
    return
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    res.status(422).json({ message: 'Максимальный размер 500KB' })
  }
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Listening on port ${port}...`))
