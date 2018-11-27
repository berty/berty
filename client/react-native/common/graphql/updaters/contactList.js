import { genericUpdater } from '../../relay'
import { merge } from '../../helpers'

export default context => [
  genericUpdater(context.fragments.ContactList, 'ContactList', {
    ...context.queries.ContactList.defaultVariables,
    count: undefined,
    cursor: undefined,
  }),
  genericUpdater(context.fragments.ContactList, 'ContactList', {
    ...merge([
      context.queries.ContactList.defaultVariables,
      { filter: { status: 3 } },
    ]),
    count: undefined,
    cursor: undefined,
  }),
  genericUpdater(context.fragments.ContactList, 'ContactList', {
    ...merge([
      context.queries.ContactList.defaultVariables,
      { filter: { status: 4 } },
    ]),
    count: undefined,
    cursor: undefined,
  }),
]
