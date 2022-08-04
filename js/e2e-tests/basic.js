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

const startAppAndCreateAccount = async caps => {
	const driver = await wdio.remote({
		path: '/wd/hub',
		port: 4723,
		capabilities: caps,
	})

	await pressButton(driver, 'Create an account')
	await pressButton(driver, 'Default mode')
	await pressButton(driver, "Let's go")
	await pressButton(driver, 'SKIP') // skip push notif perm request
	await pressButton(driver, 'Continue')
	await pressButton(driver, 'Start using Berty')

	return driver
}

const joinGroupFromHome = async (driver, link) => {
	await setInputValue(driver, 'Search keyword', link)
	await pressButton(driver, 'Open Berty Link')
	await pressButton(driver, 'Join this group')
}

const main = async () => {
	const capabilities = getCapabilitiesFromEnv()

	const device = await startAppAndCreateAccount(capabilities)

	await joinGroupFromHome(device, groupLink)

	// check that the group name is visible
	await waitForElementByAccessibilityId(device, groupName)

	await device.deleteSession()
}

main()
