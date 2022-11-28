const testIDs = require('../../../packages/utils/testing/testIDs.json')
const { pressButton } = require('../lib/lib')

const createAccount = async driver => {
	// TODO: check if __DEV__ mode
	/* await pressButton(driver, `~${testIDs['select-node-dont-ask']}`)
	await pressButton(driver, `~${testIDs['select-node-continue']}`) */
	await pressButton(driver, `~${testIDs['create-account-button']}`)
	await pressButton(driver, `~${testIDs['default-mode-button']}`)
	await pressButton(driver, `~${testIDs['lets-go-button']}`)
	await pressButton(driver, `~${testIDs['permission-alt-button']}`)
	await pressButton(driver, '~Continue') // continue is the natif text of the alert after the perm request
	await pressButton(driver, `~${testIDs['start-using-button']}`)
}

module.exports = {
	createAccount,
}
