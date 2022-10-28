const { getDrivers, iphoneList } = require('./driver')
const { pressButton, setInputValue, getTextInElement } = require('./lib')

/**
 * This test does the onboarding, joins a group and sends a message to the group on two simulators
 */

const groupName = 'random-group-18708'
const groupLink = `https://berty.tech/id#group/8ejngpAxnMQKGMuM2AUsuWi5BJg7m9bDN25hjn7mnfx4sgV7FooCqMcJrto7fbTTeRo4ZmwP78F113XJWkGS9d3LYb9Lox7hYKXMRPHZUMb1f5gZkQAwy5UG12QjFP5E5YGq7BtMBD5GcsRVRv7bfof1gKjjyKkzmkKZEmeLsw92BzYsDcuviBX5Vt1vsg3iFgWuxxjPxbmuFEu9kTdGVzhsxqF1Tk9gKnf9BrJQbsww2w3j5JqjpyBvNvzFzZJt1Vvt2wgFifriAnxAppZ5NqAHJBHr/name=${groupName}`

const createAccount = async driver => {
	await pressButton(driver, "Don't ask me again")
	await pressButton(driver, 'Continue')
	await pressButton(driver, 'Create an account')
	await pressButton(driver, 'Default mode')
	await pressButton(driver, "Let's go")
	await pressButton(driver, 'Skip') // skip push notif perm request
	await pressButton(driver, 'Continue')
	await pressButton(driver, 'Start using Berty')
}

const joinGroupFromHome = async driver => {
	await setInputValue(driver, 'Search keyword', groupLink)
	await pressButton(driver, 'Open Berty Link')
	await pressButton(driver, 'Join this group')
}

const checkIfSenderMessageExist = async (device, senderName, message) => {
	const senderNameText = await getTextInElement(device, senderName)
	const messageText = await getTextInElement(device, message)

	if (senderNameText !== senderName || messageText !== message) {
		throw new Error("contact message doesn't exist")
	}
}

const sendMessageToGroup = async (device, message) => {
	await setInputValue(device, 'ChatTextInput', message)
	await pressButton(device, 'ChatInputButton')
}

const main = async () => {
	const drivers = await getDrivers(2)

	if (drivers.length < 2) {
		throw new Error('Not enough devices')
	}

	await Promise.all(drivers.map(createAccount))
	await Promise.all(drivers.map(joinGroupFromHome))

	await sendMessageToGroup(drivers[0], 'hello from device 1')
	await sendMessageToGroup(drivers[1], 'hello from device 2')

	await checkIfSenderMessageExist(drivers[0], iphoneList[1], 'hello from device 2')
	await checkIfSenderMessageExist(drivers[1], iphoneList[0], 'hello from device 1')

	await drivers[0].deleteSession()
	await drivers[1].deleteSession()
}

main()
