const { pressButton } = require('../lib/lib')

const createAccount = async driver => {
	// TODO: check if __DEV__ mode
	// await pressButton(driver, "~Don't ask me again")
	// await pressButton(driver, '~Continue')
	await pressButton(driver, '~Create an account')
	await pressButton(driver, '~Default mode')
	await pressButton(driver, "~Let's go")
	await pressButton(driver, '~Skip') // skip push notif perm request
	await pressButton(driver, '~Continue')
	await pressButton(driver, '~Start using Berty')
}

module.exports = {
	createAccount,
}
