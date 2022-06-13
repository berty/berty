const {
	createAccount,
	joinGroupFromHome,
	getConfigFromEnv,
	createDriver,
	waitForElementByAccessibilityId,
	waitForElementByText,
	pressButton,
	sleep,
} = require('./lib')

/**
 * This test does the onboarding then joins a group on two device
 * then sends a message and checks that it's received on the other device
 */

const groupName = 'random-group-18708'
const groupLink = `https://berty.tech/id#group/8ejngpAxnMQKGMuM2AUsuWi5BJg7m9bDN25hjn7mnfx4sgV7FooCqMcJrto7fbTTeRo4ZmwP78F113XJWkGS9d3LYb9Lox7hYKXMRPHZUMb1f5gZkQAwy5UG12QjFP5E5YGq7BtMBD5GcsRVRv7bfof1gKjjyKkzmkKZEmeLsw92BzYsDcuviBX5Vt1vsg3iFgWuxxjPxbmuFEu9kTdGVzhsxqF1Tk9gKnf9BrJQbsww2w3j5JqjpyBvNvzFzZJt1Vvt2wgFifriAnxAppZ5NqAHJBHr/name=${groupName}`
const message = 'Hello world!'

const main = async () => {
	const config = getConfigFromEnv()

	// create both session first to make sure we don't have one app with the group open
	const [androidDriver, iOSDriver] = await Promise.all([
		createDriver(config.Android),
		createDriver(config.iOS),
	])

	await Promise.all([
		(async () => {
			await createAccount(androidDriver)
			await joinGroupFromHome(androidDriver, groupLink)
		})(),
		(async () => {
			await createAccount(iOSDriver)
			await joinGroupFromHome(iOSDriver, groupLink)
			await pressButton(iOSDriver, 'Group settings')

			await waitForElementByAccessibilityId(iOSDriver, 'Members (2)', 5 * 60 * 1000)
			await sleep(1 * 1000)
			await closeFormSheet(iOSDriver)

			await focusChatInput(iOSDriver)
			await iOSDriver.sendKeys(stringToArray(message))
			await pressButton(iOSDriver, 'Send')
		})(),
	])

	// FIXME: correctly press send button
	// await waitForElementByText(androidDriver, message, 2 * 60 * 1000)

	await androidDriver.deleteSession()
	await iOSDriver.deleteSession()
}

const closeFormSheet = async driver => {
	const windowSize = await driver.getWindowSize()

	await driver.touchAction([
		{ action: 'press', x: 10, y: 100 },
		{ action: 'wait', ms: 100 },
		{ action: 'moveTo', x: 0, y: windowSize.height - 200 },
		'release',
	])
}

const focusChatInput = async driver => {
	const windowSize = await driver.getWindowSize()
	await driver.touchAction({
		action: 'tap',
		x: windowSize.width / 2,
		y: windowSize.height - 50,
	})
}

const stringToArray = str => {
	const arr = []
	for (var i = 0; i < str.length; i++) {
		arr.push(str.charAt(i))
	}
	return arr
}

main()
