import L10nTypes from './l10n-types.enum'
import Languages from './languages.enum'

const messages = {}
messages[Languages.RU] = {}
messages[Languages.EN] = {}
messages[Languages.KA] = {}

messages[Languages.RU][L10nTypes.UNKNOWN_ERROR] = 'Возникла непредвиденная ошибка.'

messages[Languages.RU][L10nTypes.START_GREETINGS] = 'Добрейшего дня, рад вас видеть! Я помогаю людям создавать себе жизненные цели и отслеживать их выполнение. Чтобы создать цель, воспользуйтесь командой /create'
messages[Languages.RU][L10nTypes.START_EXISTED_GREETINGS] = 'С возвращением!'

messages[Languages.RU][L10nTypes.ACHIEVEMENTS_NOT_FOUND] = 'У вас всё впереди!'
messages[Languages.RU][L10nTypes.ACHIEVEMENTS_LIST_LABEL] = 'Вы достигли немалого прогресса:'
messages[Languages.RU][L10nTypes.ACHIEVEMENTS_CREATION_SUCCESS] = 'Прекрасное достижение!'

messages[Languages.RU][L10nTypes.GOAL_NOT_FOUND] = 'Я не могу найти эту цель, это очень странно.'
messages[Languages.RU][L10nTypes.GOALS_NOT_FOUND] = 'Вы ещё не установили ни одной цели.'
messages[Languages.RU][L10nTypes.GOALS_LIST_LABEL] = 'Ваши цели:'
messages[Languages.RU][L10nTypes.GOALS_CREATION_SUCCESS] = 'Достойная цель! Теперь я буду периодически интересоваться вашим прогрессом по этой задаче.'
messages[Languages.RU][L10nTypes.GOALS_CREATION_WAITING_FOR_TITLE] = 'Как назовём эту задачу?'
messages[Languages.RU][L10nTypes.GOALS_CREATION_WAITING_FOR_DESCRIPTION] = 'Записали. А как бы вы вкратце описали эту задачу? Можно всего пару слов.'
messages[Languages.RU][L10nTypes.GOALS_CREATION_WAITING_FOR_TILL] = ({ date }) => {
  return `Когда дедлайн у этой цели? (${date})`
}

export default messages