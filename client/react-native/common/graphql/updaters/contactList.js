import { contact } from '../../utils'
import { merge } from '../../helpers'
import { updater as updaterHelper } from '../../relay'

export const defaultArguments = {
  filter: contact.default,
  orderBy: '',
  orderDesc: false,
}

export default (store, args) =>
  updaterHelper(store).connection(
    'ContactList_ContactList',
    merge([defaultArguments, args])
  )
