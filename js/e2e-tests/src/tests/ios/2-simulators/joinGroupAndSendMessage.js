const { iphoneList, getIOSDrivers } = require('../../../lib/iosDriver')
const { pressButton, setInputValue } = require('../../../lib/lib')
const { checkMessage } = require('../../../utils/checkMessage')
const { createAccount } = require('../../../utils/createAccount')
const { sendMessage } = require('../../../utils/sendMessage')

const DEVICES_NEEDED = 2
const GROUP_NAME = 'random-group-18708'
const GROUP_LINK = `https://berty.tech/id#group/8ejngpAxnMQKGMuM2AUsuWi5BJg7m9bDN25hjn7mnfx4sgV7FooCqMcJrto7fbTTeRo4ZmwP78F113XJWkGS9d3LYb9Lox7hYKXMRPHZUMb1f5gZkQAwy5UG12QjFP5E5YGq7BtMBD5GcsRVRv7bfof1gKjjyKkzmkKZEmeLsw92BzYsDcuviBX5Vt1vsg3iFgWuxxjPxbmuFEu9kTdGVzhsxqF1Tk9gKnf9BrJQbsww2w3j5JqjpyBvNvzFzZJt1Vvt2wgFifriAnxAppZ5NqAHJBHr/name=${GROUP_NAME}`

/**
 * This test does the onboarding, joins a group and sends a message to the group on two simulators
 */

const joinGroupFromHome = async driver => {
	await setInputValue(driver, '~Search keyword', GROUP_LINK)
	await pressButton(driver, '~Open Berty Link')
	await pressButton(driver, '~Join this group')
}

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
