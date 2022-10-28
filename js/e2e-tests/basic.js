const wdio = require('webdriverio')

const { pressButton, setInputValue, getCapabilitiesFromEnv , waitForElementByAccessibilityId } = require('./lib')

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
  const senderNameElem = await waitForElementByAccessibilityId(device, senderName)
  const messageElem = await waitForElementByAccessibilityId(device, message)

  const senderNameText = await senderNameElem.getText()
  const messageText = await messageElem.getText()
  if (senderNameText !== senderName || messageText !== message) {
    throw new Error(`contact message doesn't exist`)
  }
}

const sendMessageToGroup = async (device, message) => {
	await setInputValue(device, 'ChatTextInput', message)
	await pressButton(device, 'ChatInputButton')
}

const main = async () => {
	const capabilities1 = getCapabilitiesFromEnv('iPhone 11')
	const capabilities2 = getCapabilitiesFromEnv('iPhone 11 Pro')

	const driver1Promise = wdio.remote({
		port: 4723,
		capabilities: { ...capabilities1, 'appium:wdaLocalPort': 8101 },
	})
	const driver2Promise = wdio.remote({
		port: 4723,
		capabilities: capabilities2,
	})

	const [driver1, driver2] = await Promise.all([driver1Promise, driver2Promise])

	await Promise.all([createAccount(driver1), createAccount(driver2)])
	await Promise.all([joinGroupFromHome(driver1), joinGroupFromHome(driver2)])

	await sendMessageToGroup(driver1, 'hello from device 1')
	await sendMessageToGroup(driver2, 'hello from device 2')

  await checkIfSenderMessageExist(driver1, 'iPhone 11 Pro', 'hello from device 2')
  await checkIfSenderMessageExist(driver2, 'iPhone 11', 'hello from device 1')

	await driver1.deleteSession()
	await driver2.deleteSession()
}

main()
