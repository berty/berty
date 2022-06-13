const {
	createAccount,
	joinGroupFromHome,
	waitForElementByAccessibilityId,
	getConfigFromEnv,
	waitForElementByText,
	createDriver,
} = require('./lib')

/**
 * This test does the onboarding then joins a group and finally checks that the group name is displayed
 */

const groupName = 'random-group-18708'
const groupLink = `https://berty.tech/id#group/8ejngpAxnMQKGMuM2AUsuWi5BJg7m9bDN25hjn7mnfx4sgV7FooCqMcJrto7fbTTeRo4ZmwP78F113XJWkGS9d3LYb9Lox7hYKXMRPHZUMb1f5gZkQAwy5UG12QjFP5E5YGq7BtMBD5GcsRVRv7bfof1gKjjyKkzmkKZEmeLsw92BzYsDcuviBX5Vt1vsg3iFgWuxxjPxbmuFEu9kTdGVzhsxqF1Tk9gKnf9BrJQbsww2w3j5JqjpyBvNvzFzZJt1Vvt2wgFifriAnxAppZ5NqAHJBHr/name=${groupName}`

const main = async () => {
	const config = getConfigFromEnv()
	if (!config.selected) {
		throw new Error('missing TESTING_PLATFORM environment variable')
	}

	const driver = await createDriver(config.selected)

	await createAccount(driver)

	await joinGroupFromHome(driver, groupLink)

	// check that the group name is correctly displayed
	switch (driver.capabilities.platformName) {
		case 'iOS':
			await waitForElementByAccessibilityId(driver, groupName)
			break
		case 'Android':
			await waitForElementByText(driver, groupName)
			break
		default:
			throw new Error(`platform '${driver.capabilities.platformName}' not supported`)
	}

	await driver.deleteSession()
}

main()
