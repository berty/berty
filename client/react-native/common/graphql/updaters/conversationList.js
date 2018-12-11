import { genericUpdater } from '../../relay'

export default context => [
  genericUpdater(context.fragments.ConversationList, 'ConversationList', {
    ...context.queries.ConversationList.defaultVariables,
    count: undefined,
    cursor: undefined,
  }),
]
