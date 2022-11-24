const { setInputValue, pressButton } = require('../lib/lib')

const sendMessage = async (device, message) => {
	await setInputValue(device, '~ChatTextInput', message)
	await pressButton(device, '~ChatInputButton')
}

module.exports = {
	sendMessage,
}
