const testIDs = require('../../../packages/utils/testing/testIDs.json')
const { pressButton, setInputValue } = require('../lib/lib')

const GROUP_NAME = 'random-group-18708'
const GROUP_LINK = `https://berty.tech/id#group/8ejngpAxnMQKGMuM2AUsuWi5BJg7m9bDN25hjn7mnfx4sgV7FooCqMcJrto7fbTTeRo4ZmwP78F113XJWkGS9d3LYb9Lox7hYKXMRPHZUMb1f5gZkQAwy5UG12QjFP5E5YGq7BtMBD5GcsRVRv7bfof1gKjjyKkzmkKZEmeLsw92BzYsDcuviBX5Vt1vsg3iFgWuxxjPxbmuFEu9kTdGVzhsxqF1Tk9gKnf9BrJQbsww2w3j5JqjpyBvNvzFzZJt1Vvt2wgFifriAnxAppZ5NqAHJBHr/name=${GROUP_NAME}`

const joinGroupFromHome = async driver => {
	await setInputValue(driver, `~${testIDs['home-input']}`, GROUP_LINK)
	await pressButton(driver, `~${testIDs['open-berty-link']}`)
	const joinButton = `~${testIDs['group-join']}`
	await pressButton(driver, joinButton)
}

module.exports = {
	joinGroupFromHome,
}
