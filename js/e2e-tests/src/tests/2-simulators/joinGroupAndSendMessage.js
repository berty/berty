const { iphoneList, getIOSDrivers } = require('../../lib/iosDriver')
const { checkMessage } = require('../../utils/checkMessage')
const { createAccount } = require('../../utils/createAccount')
const { joinGroupFromHome } = require('../../utils/joinGroupFromHome')
const { sendMessage } = require('../../utils/sendMessage')

const DEVICES_NEEDED = 2

/**
 * This test does the onboarding, joins a group and sends a message to the group on two simulators
 */

const main = async () => {
	const drivers = await getIOSDrivers(DEVICES_NEEDED)

	if (drivers.length < DEVICES_NEEDED) {
		throw new Error('Not enough devices')
	}

	await Promise.all(drivers.map(createAccount))
	await Promise.all(drivers.map(joinGroupFromHome))

	await sendMessage(drivers[0], 'hello from device 1')
	await sendMessage(drivers[1], 'hello from device 2')

	await checkMessage(drivers[0], 'hello from device 2', iphoneList[1])
	await checkMessage(drivers[1], 'hello from device 1', iphoneList[0])

	await drivers[0].deleteSession()
	await drivers[1].deleteSession()
}

main()
