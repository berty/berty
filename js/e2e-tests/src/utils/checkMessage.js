const { getTextInElement } = require('../lib/lib')

const checkMessage = async (device, message, senderName) => {
	const messageText = await getTextInElement(device, `~${message}`)

	if (messageText !== message) {
		throw new Error("contact message doesn't exist")
	}

	// if is group message
	if (senderName) {
		const senderNameText = await getTextInElement(device, `~${senderName}`)

		if (senderNameText !== senderName) {
			throw new Error("contact sender doesn't exist")
		}
	}
}

module.exports = {
	checkMessage,
}
