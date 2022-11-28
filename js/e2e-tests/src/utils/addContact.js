const testIDs = require('../../../packages/utils/testing/testIDs.json')
const { setInputValue, pressButton } = require('../lib/lib')

const addContact = async (driver, invitationLink) => {
	await setInputValue(driver, `~${testIDs['home-input']}`, invitationLink)
	await pressButton(driver, `~${testIDs['open-berty-link']}`)
	await pressButton(driver, `~${testIDs['group-join']}`)
	await pressButton(driver, `~${testIDs.conversation}`)
}

module.exports = {
	addContact,
}
