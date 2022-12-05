const testIDs = require('../../../../packages/utils/testing/testIDs.json')
const { getIOSDrivers } = require('../../lib/iosDriver')
const { pressButton, getElementLocation } = require('../../lib/lib')
const { addContact } = require('../../utils/addContact')
const { createAccount } = require('../../utils/createAccount')
const { messages } = require('../../utils/messages')
const { sendMessage } = require('../../utils/sendMessage')
const { shareAccount } = require('../../utils/shareAccount')

const DEVICES_NEEDED = 2

/**
 * This test does the onboarding, copy an invitation link to start a conversation and sends 100 messages then check if the messages are in the right order
 */

const acceptInvitationAndSend100Messages = async driver => {
	await pressButton(driver, `~${testIDs['request-button']}`)
	await pressButton(driver, `~${testIDs['accept-group']}`)

	for (const message of messages) {
		await sendMessage(driver, message)
	}
}

const checkMessagesOrder = async driver => {
	let previousY

	for (const message of messages) {
		const location = await getElementLocation(driver, `~${message}`)

		if (previousY !== undefined && location.y < previousY) {
			throw new Error('Messages are not in the right order')
		}
		previousY = location.y
	}
}

const main = async () => {
	const drivers = await getIOSDrivers(DEVICES_NEEDED)

	if (drivers.length < DEVICES_NEEDED) {
		throw new Error('Not enough devices')
	}

	await Promise.all(drivers.map(createAccount))

	// we copy invitation link from first device
	const invitationLink = await shareAccount(drivers[0])

	// we add contact on second device thanks to invitation link
	await addContact(drivers[1], invitationLink)

	// we accept the invitation and send 100 messages on first device
	await acceptInvitationAndSend100Messages(drivers[0])

	// we check that the messages have been received in the right order on second device
	await checkMessagesOrder(drivers[1])

	await drivers[0].deleteSession()
	await drivers[1].deleteSession()
}

main()
