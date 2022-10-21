const wdio = require('webdriverio')

const {
	pressButton,
	setInputValue,
	waitForElementByAccessibilityId,
	getCapabilitiesFromEnv,
} = require('./lib')

/**
 * This test does the onboarding then joins a group and finally checks that the group name is displayed
 */

const groupName = 'random-group-18708'
const groupLink = `https://berty.tech/id#group/8ejngpAxnMQKGMuM2AUsuWi5BJg7m9bDN25hjn7mnfx4sgV7FooCqMcJrto7fbTTeRo4ZmwP78F113XJWkGS9d3LYb9Lox7hYKXMRPHZUMb1f5gZkQAwy5UG12QjFP5E5YGq7BtMBD5GcsRVRv7bfof1gKjjyKkzmkKZEmeLsw92BzYsDcuviBX5Vt1vsg3iFgWuxxjPxbmuFEu9kTdGVzhsxqF1Tk9gKnf9BrJQbsww2w3j5JqjpyBvNvzFzZJt1Vvt2wgFifriAnxAppZ5NqAHJBHr/name=${groupName}`

const joinGroupFromHome = async driver => {
	await pressButton(driver, "Don't ask me again")
	await pressButton(driver, 'Continue')
	await pressButton(driver, 'Create an account')
	await pressButton(driver, 'Default mode')
	await pressButton(driver, "Let's go")
	await pressButton(driver, 'Skip') // skip push notif perm request
	await pressButton(driver, 'Continue')
	await pressButton(driver, 'Start using Berty')

	await setInputValue(driver, 'Search keyword', groupLink)
	await pressButton(driver, 'Open Berty Link')
	await pressButton(driver, 'Join this group')
}

const sendMessageToGroup = async (device, message) => {
	await setInputValue(device, 'ChatTextInput', message)
	await pressButton(device, 'ChatInputButton')
}

const main = async () => {
	const capabilities1 = getCapabilitiesFromEnv('iPhone 11')
	const capabilities2 = getCapabilitiesFromEnv('iPhone 11 Pro')

	const driver1 = await wdio.remote({
		port: 4723,
		capabilities: { ...capabilities1, 'appium:wdaLocalPort': 8101 },
	})
	const driver2 = await wdio.remote({
		port: 4723,
		capabilities: capabilities2,
	})

	await Promise.all([joinGroupFromHome(driver1), joinGroupFromHome(driver2)])

	await sendMessageToGroup(driver1, 'hello from device 1')
	await sendMessageToGroup(driver2, 'hello from device 2')

	// await device1.deleteSession()
	// await device2.deleteSession()
}

main()
