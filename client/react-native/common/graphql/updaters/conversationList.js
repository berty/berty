import { conversation } from '../../utils'
import { updater } from '../../relay'

export const defaultArguments = {
  filter: conversation.default,
  orderBy: '',
  orederDesc: false,
}

export default store =>
  updater(store).connection(
    'ConversationList_ConversationList',
    defaultArguments
  )
