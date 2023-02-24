import TelegramBot from 'node-telegram-bot-api'
import { User } from '../models/user.model'
import Languages from '../utils/languages.enum'
import L10nTypes from '../utils/l10n-types.enum'
import messages from '../utils/tg-messages.enum'
import { TGContext } from './tg-context'
import { IUser } from '../interfaces/models/user.interface'
import TGContextTypes from '../utils/tg-context-types.enum'
import { Goal } from '../models/goal.model'
import TG_COMMANDS from '../utils/tg-commands.enum'
import { TGChat } from '../models/tg-chat.model'
import { IGoal } from '../interfaces/models/goal.interface'

type ParseMode = 'Markdown' | 'MarkdownV2' | 'HTML'

const token = process.env.TG_TOKEN || ''
const host = process.env.TG_HOST || ''
const logChatId = process.env.TG_CHAT_ID || '0'
const discussionChatId = process.env.TG_PRIVATE_ID || '0'

export class TelegramBotWrapper {
  private bot: TelegramBot | null = null
  private lastPamagityTime = 0
  private botContext: TGContext | null = null

  constructor() {
    if (host && token) {
      try {
        this.botContext = new TGContext()
        this.bot = new TelegramBot(token)

        if (this.bot) {
          this.bot.setWebHook(`https://${host}/api/bots/bot${token}`)

          this.bot.onText(/\/start(.*)/, this.onStart.bind(this)) // TG_COMMANDS.START
          this.bot.onText(/\/goals(.*)/, this.getGoals.bind(this)) // TG_COMMANDS.GOALS
          this.bot.onText(/\/progress(.*)/, this.getGoalProgress.bind(this)) // TG_COMMANDS.PROGRESS
          this.bot.on('callback_query', this.onCallbackQuery.bind(this)) // TG_COMMANDS.PARCELS
          this.bot.on('message', this.onMessage.bind(this))
        }
      } catch (error) {
        console.log(error)
        this.bot = null
        this.botContext = null
      }
    }
  }

  public processUpdate(data) {
    if (!this.bot) {
      console.error('Bot is not running')
      return
    }
    this.bot.processUpdate(data)
  }

  public async sendMessage(chatId: number, message: string, options?: object) {
    if (!this.bot) {
      console.error('Bot is not running')
      return
    }
    const botMessage = await this.bot.sendMessage(chatId, message, options)
    if (botMessage) {
      await this.logMessage(chatId, botMessage.message_id, botMessage.text as string, null, null)
    }
  }

  public async sendL10NMessage(msg: TelegramBot.Message, messageType: L10nTypes, messageParams: any, options?: object) {
    const chatId = msg.chat.id

    const language = this.getLang(msg)

    let message = messages[language][messageType] || messages[Languages.RU][messageType] // fallback
    if (typeof message === 'function') {
      message = message(messageParams)
    }
    await this.sendMessage(chatId, message, options)
  }

  private async onStart(msg, match) {
    if (!match) {
      return
    }

    const chatId = msg.chat.id
    const lang = msg.from?.language_code || Languages.RU

    this.botContext?.clearContext(chatId)

    const username = msg.chat.username

    const existedUser = await User.findOne({
      chatId,
    })

    let messageType = L10nTypes.START_EXISTED_GREETINGS
    const messageParams = {}
    if (!existedUser) {
      const user = new User()

      user.username = username
      user.createdAt = new Date()
      user.chatId = chatId
      user.goals = []

      await user.save()

      messageType = L10nTypes.START_GREETINGS
    }

    this.sendL10NMessage(msg, messageType, messageParams, { parse_mode: 'HTML' as ParseMode })
  }

  private async getGoalProgress(msg, match) {
    const chatId = msg.chat.id
    this.botContext?.clearContext(chatId)
    const user = await this.getUserByChatID(chatId)
    if (!user) {
      return
    }

    await user.populate('goals')
    const goalId: string = msg.text

    const goal = await Goal.findById(goalId)
    if (!goal) {
      this.sendL10NMessage(msg, L10nTypes.GOAL_NOT_FOUND, {}, { parse_mode: 'HTML' as ParseMode })
      return
    }

    const achievementsCount = goal.achievements.length
    const language = this.getLang(msg)

    const message = await this.getAchievementsListMessage(goal, 1, language)
    const options = Object.assign({ parse_mode: 'HTML' as ParseMode }, this.getPagination(1, Math.ceil(achievementsCount / 10)))
    this.sendMessage(msg.chat.id, message, options)
  }

  private async getGoals(msg, match) {
    const chatId = msg.chat.id
    this.botContext?.clearContext(chatId)
    const user = await this.getUserByChatID(chatId)
    if (!user) {
      return
    }

    const goalsCount = await Goal.count({
      user: user._id,
      deleted: false,
    })

    const language = this.getLang(msg)

    const message = await this.getGoalsListMessage(user, 1, language)
    const options = Object.assign({ parse_mode: 'HTML' as ParseMode }, this.getPagination(1, Math.ceil(goalsCount / 10)))
    this.sendMessage(msg.chat.id, message, options)
  }

  private getLang(msg: TelegramBot.Message) {
    const tgLang = msg.from?.language_code || Languages.RU
    console.log('language_code: ', msg.from?.language_code)

    let language = Languages.RU
    for (const lang of Object.values(Languages)) {
      console.log('lang: ', language)
      if (lang === tgLang) {
        language = tgLang
        break
      }
    }
    console.log('language: ', language)
    return language
  }

  private async onCallbackQuery(messageInfo) {
    if (!messageInfo?.message) {
      console.log(messageInfo)
      console.log('no chat ID')
      return
    }
    const chatId = messageInfo.message.chat.id
    const user = await this.getUserByChatID(chatId)
    if (!user) {
      return
    }

    const goal = this.botContext?.getActiveGoal(chatId)
    if (!goal) {
      return
    }

    let itemsCount = 0

    const msg = messageInfo.message
    const btnData = messageInfo.data || 'goals_1'
    const parts = btnData.split('_')
    const type = parts[0] || 'goals'
    const pageNumber = parseInt(parts[1])
    const language = this.getLang(msg)

    let message = ''
    if (type === 'achievements') {
      itemsCount = goal.achievements.length
      message = await this.getAchievementsListMessage(goal, pageNumber, language)
    } else {
      itemsCount = await Goal.count({
        user: user._id,
        deleted: false,
      })
      message = await this.getGoalsListMessage(user, pageNumber, language)
    }

    const editOptions = Object.assign({ parse_mode: 'HTML' as ParseMode }, this.getPagination(pageNumber, Math.ceil(itemsCount / 10), type), { chat_id: msg.chat.id, message_id: msg.message_id})
    this.bot?.editMessageText(message, editOptions)
  }

  private async onMessage(msg, metadata) {
    const chatId = msg.chat.id
    let isKnownCommard = false
    let commandInMessage: string | null = null
    Object.values(TG_COMMANDS).forEach((command) => {
      if (msg.text?.startsWith(command)) {
        isKnownCommard = true
        commandInMessage = command
      }
    })

    const user = await this.getUserByChatID(chatId)
    const lang = this.getLang(msg)
    await this.logMessage(chatId, msg.message_id, msg.text || '', user, commandInMessage)

    if (isKnownCommard) {
      return // Всё в порядке, действий не требуется
    }

    if (this.botContext?.is(chatId, TGContextTypes.WAITING_FOR_GOAL_TITLE)) {
      const goal = new Goal()
      goal.title = msg.text.length > 100 ? msg.text.substring(0, 100) + '...' : msg.text
      goal.description = ''
      goal.from = new Date()

      const date = new Date()
      date.setMonth(date.getMonth() + 1)
      goal.till = date

      await goal.save()
      this.botContext?.setContext(chatId, TGContextTypes.WAITING_FOR_GOAL_DESCRIPTION)
      this.botContext?.setActiveGoal(chatId, goal)

      this.sendL10NMessage(msg, L10nTypes.GOALS_CREATION_WAITING_FOR_DESCRIPTION, {})
    } else if (this.botContext?.is(chatId, TGContextTypes.WAITING_FOR_GOAL_DESCRIPTION)) {
      const goal = this.botContext?.getActiveGoal(chatId)
      if (!goal) {
        return
      }
      goal.description = msg.text.length > 500 ? msg.text.substring(0, 500) + '...' : msg.onText

      await goal.save()
      this.botContext?.setContext(chatId, TGContextTypes.WAITING_FOR_GOAL_TILL)

      this.sendL10NMessage(msg, L10nTypes.GOALS_CREATION_WAITING_FOR_TILL, {
        date: goal.from.toJSON().slice(0, 10),
      })
    } else if (this.botContext?.is(chatId, TGContextTypes.WAITING_FOR_GOAL_FROM)) {
      const goal = this.botContext?.getActiveGoal(chatId)
      if (!goal) {
        return
      }
      goal.from = new Date(msg.text)

      await goal.save()
      this.botContext?.setContext(chatId, TGContextTypes.WAITING_FOR_GOAL_TILL)

      this.sendL10NMessage(msg, L10nTypes.GOALS_CREATION_WAITING_FOR_TILL, {
        date: goal.till.toJSON().slice(0, 10),
      })
    } else if (this.botContext?.is(chatId, TGContextTypes.WAITING_FOR_GOAL_TILL)) {
      const goal = this.botContext?.getActiveGoal(chatId)
      if (!goal) {
        return
      }
      goal.till = new Date(msg.text)

      await goal.save()
      this.botContext?.clearContext(chatId)
      this.botContext?.clearActiveGoal(chatId)

      this.sendL10NMessage(msg, L10nTypes.GOALS_CREATION_SUCCESS, {})
    } else if (this.botContext?.is(chatId, TGContextTypes.WAITING_FOR_ACHIEVEMENT)) {
      const goal = this.botContext?.getActiveGoal(chatId)
      if (!goal) {
        return
      }

      goal.achievements.push({
        createdAt: new Date(),
        text: msg.text,
        messageId: msg.message_id,
      })

      await goal.save()

      this.sendL10NMessage(msg, L10nTypes.ACHIEVEMENTS_CREATION_SUCCESS, {})
      this.botContext?.clearContext(chatId)
      this.botContext?.clearActiveGoal(chatId)
    } else {
      if (Date.now() - this.lastPamagityTime > 30 * 1000) {
        this.bot?.sendMessage(logChatId, 'Мне написали что-то странное, я не понимаю. ПАМАГИТИ!')
        this.lastPamagityTime = Date.now()
      }
      this.bot?.forwardMessage(logChatId, chatId, msg.message_id)
    }
  }


  private async logMessage (chatId: number, messageId: number, text: string, user: IUser | null, commandInMessage: string | null) {
    let chat = await TGChat.findOne({
      chatId,
    })
    if (!chat) {
      chat = new TGChat()
      chat.user = user ? user._id : null,
      chat.chatId = chatId
      chat.messages = []
    }

    chat.logMessage(messageId, text, user || null, commandInMessage || null)
    await chat.save()
  }

  private async getUserByChatID (chatId: number) {
    const user = await User.findOne({
      'chatId': chatId,
    }).populate('goals')

    return user
  }

  private async getGoalsListMessage(user: IUser, pageNumber: number, lang: Languages) {
    const goals = await Goal.find({
      user: user._id,
    })
    .skip((pageNumber - 1) * 10)
    .limit(10)

    let message = ''
    let messageType = L10nTypes.UNKNOWN_ERROR
    if (goals.length === 0) {
      messageType = L10nTypes.GOALS_NOT_FOUND
    } else {
      message = messages[lang][L10nTypes.GOALS_LIST_LABEL]
      goals.forEach((goal) => {
        const from = goal.from.toJSON().slice(0, 10)
        const till = goal.till.toJSON().slice(0, 10)
        message += `\n${goal.title}`
        if (goal.description) {
          message += `\n<code>${goal.description}</code>`
        }
        message += `\nначало: ${from} \nдедлайн: ${till}`
      })
    }

    return message
  }

  private async getAchievementsListMessage(goal: IGoal, pageNumber: number, lang: Languages) {
    const achievements = goal.achievements.slice((pageNumber - 1) * 10, pageNumber * 10)

    let message = ''
    let messageType = L10nTypes.UNKNOWN_ERROR
    if (achievements.length === 0) {
      messageType = L10nTypes.ACHIEVEMENTS_NOT_FOUND
    } else {
      message = messages[lang][L10nTypes.ACHIEVEMENTS_LIST_LABEL]
      achievements.forEach((achievement) => {
        let text = achievement.text
        if (achievement.text.length > 100) {
          text = achievement.text.substring(0, 100) + '...'
        }

        message += `\n${achievement.createdAt.toJSON().slice(0, 10)}: ${text}`
      })
    }

    return message
  }

  private getPagination( current: number, maxpage: number, type = 'goals' ) {
    const keys: { text: string, callback_data: string }[] = []
    if (current > 1) {
      keys.push({
        text: '«1',
        callback_data: `${type}_1`,
      })
    }
    if (current > 2) {
      keys.push({
        text: `‹${current - 1}`,
        callback_data: `${type}_${current - 1}`,
      })
    }

    keys.push({
      text: `-${current}-`,
      callback_data: `${type}_${current}`,
    })
    if (current < maxpage - 1) {
      keys.push({
        text: `${current + 1}›`,
        callback_data: `${type}_${current + 1}`,
      })
    }
    if (current < maxpage) {
      keys.push({
        text: `${maxpage}»`,
        callback_data: `${type}_${maxpage}`,
      })
    }

    return {
      reply_markup: {
        inline_keyboard: [ keys ],
      },
    }
  }
}