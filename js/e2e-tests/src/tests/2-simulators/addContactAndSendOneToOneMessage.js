const testIDs = require('../../../../packages/utils/testing/testIDs.json')
const { pressButton } = require('../../lib/lib')
const { addContact } = require('../../utils/addContact')
const { checkMessage } = require('../../utils/checkMessage')
const { sendMessage } = require('../../utils/sendMessage')
const { shareAccount } = require('../../utils/shareAccount')

/**
 * This test does the onboarding, copy an invitation link to start a conversation and sends a message between two simulators
 */

const acceptInvitationAndSendMessage = async driver => {
	await pressButton(driver, `~${testIDs['request-button']}`)
	await pressButton(driver, `~${testIDs['accept-group']}`)
	await sendMessage(driver, 'hello from device 1')
}

const addContactAndSendOneToOneMessage = async drivers => {
	// we copy invitation link from first device
	const invitationLink = await shareAccount(drivers[0])

	// we add contact on second device thanks to invitation link
	await addContact(drivers[1], invitationLink)

	// we accept the invitation and send a message on first device
	await acceptInvitationAndSendMessage(drivers[0])

	// we check that the message is received on second device
	await checkMessage(drivers[1], 'hello from device 1')
}

module.exports = {
	addContactAndSendOneToOneMessage,
}
