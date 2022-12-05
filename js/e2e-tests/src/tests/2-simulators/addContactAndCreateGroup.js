const testIDs = require('../../../../packages/utils/testing/testIDs.json')
const { getIOSDrivers, iphoneList } = require('../../lib/iosDriver')
const { pressButton, setInputValue } = require('../../lib/lib')
const { addContact } = require('../../utils/addContact')
const { checkMessage } = require('../../utils/checkMessage')
const { createAccount } = require('../../utils/createAccount')
const { sendMessage } = require('../../utils/sendMessage')
const { shareAccount } = require('../../utils/shareAccount')

const DEVICES_NEEDED = 2

/**
 * This test does the onboarding, copy an invitation link to start a conversation between two simulators. Then, one create a group and invite the other device
 */

const acceptInvitationAndCreateGroup = async driver => {
	await pressButton(driver, `~${testIDs['request-button']}`)
	await pressButton(driver, `~${testIDs['accept-group']}`)
	await pressButton(driver, '//XCUIElementTypeButton[@name="Back"]') // native element in navigation header corresponding to the back button
	await pressButton(driver, `~${testIDs['home-share']}`)
	await pressButton(driver, `~${testIDs['create-group-first']}`)
	await pressButton(driver, `~${iphoneList[1]}`)
	await pressButton(driver, `~${testIDs['group-next-step']}`)
	await setInputValue(driver, `~${testIDs['group-name-input']}`, 'Appium group')
	await pressButton(driver, `~${testIDs['create-group-second']}`)
}

const acceptGroupInvitationAndSendMessage = async driver => {
	await pressButton(driver, `~${testIDs['accept-group']}`)
	await sendMessage(driver, 'hello from device 2')
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

	// we accept the invitation and create a group with this contact
	await acceptInvitationAndCreateGroup(drivers[0])

	// we accept the group invitation and send a message in the group
	await acceptGroupInvitationAndSendMessage(drivers[1])

	// we check that the message is received on first device
	await checkMessage(drivers[0], 'hello from device 2', iphoneList[1])

	await drivers[0].deleteSession()
	await drivers[1].deleteSession()
}

main()
