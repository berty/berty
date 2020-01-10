import * as chat from './index'
import * as account from './account'

const store = chat.init()
console.log(store.getState())
store.dispatch(account.commands.create({ name: 'hello' }))
console.log(store.getState())
store.dispatch(account.commands.delete())
console.log(store.getState())
