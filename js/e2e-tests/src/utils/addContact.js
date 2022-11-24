const { setInputValue, pressButton } = require('../lib/lib')

const addContact = async (driver, invitationLink) => {
	await setInputValue(driver, '~Search keyword', invitationLink)
	await pressButton(driver, '~Open Berty Link')
	await pressButton(driver, '~AddContact')
	await pressButton(driver, '~conversation')
}

module.exports = {
	addContact,
}
