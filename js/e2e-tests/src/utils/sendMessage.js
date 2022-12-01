const testIDs = require('../../../packages/utils/testing/testIDs.json')
const { setInputValue, pressButton } = require('../lib/lib')

const sendMessage = async (device, message) => {
	await setInputValue(device, `~${testIDs['chat-text-input']}`, message)
	await pressButton(device, `~${testIDs['chat-input-button']}`)
}

module.exports = {
	sendMessage,
}
