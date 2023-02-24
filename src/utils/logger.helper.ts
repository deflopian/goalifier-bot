import * as winston from 'winston'
import 'winston-daily-rotate-file'

const { combine, timestamp, label, printf } = winston.format

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`
})

export const logger = winston.createLogger({
  transports: [
    new winston.transports.DailyRotateFile({
      filename: './logs/errors-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      level: 'error',
      format: combine(
        timestamp(),
        logFormat
      ),
    }),
    new winston.transports.DailyRotateFile({
      filename: './logs/access-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '40m',
      level: 'info',
      format: combine(
        timestamp(),
        logFormat
      ),
    }),
  ],
})
