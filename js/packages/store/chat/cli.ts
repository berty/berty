import * as chat from './index'
import * as account from './account'
import { createLogger } from 'redux-logger'

const store = chat.init(
	createLogger({
		titleFormatter: () => '',
		diff: true,
	}),
)
store.dispatch(account.commands.create({ name: 'hello' }))
