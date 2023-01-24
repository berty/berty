const { checkMessage } = require('../../utils/checkMessage')
const { joinGroupFromHome } = require('../../utils/joinGroupFromHome')
const { sendMessage } = require('../../utils/sendMessage')

/**
 * This test does the onboarding, joins a group and sends a message to the group on two simulators
 */

const joinGroupAndSendMessage = async (drivers, phoneName1, phoneName2) => {
	await Promise.all(drivers.map(joinGroupFromHome))

	await sendMessage(drivers[0], 'hello from device 1')
	await sendMessage(drivers[1], 'hello from device 2')

	await checkMessage(drivers[0], 'hello from device 2', phoneName2)
	await checkMessage(drivers[1], 'hello from device 1', phoneName1)
}

module.exports = {
	joinGroupAndSendMessage,
}
