import { event } from '../../utils'
import { merge } from '../../helpers'
import { updater } from '../../relay'

export const defaultArguments = {
  filter: event.default,
  orderBy: 'created_at',
  orderDesc: true,
}

export default (store, args) =>
  updater(store).connection(
    'EventList_EventList',
    merge([defaultArguments, args])
  )
