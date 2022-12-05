const testIDs = require('../../../packages/utils/testing/testIDs.json')
const { pressButton, getClipboard, swipeElement } = require('../lib/lib')

const shareAccount = async driver => {
	await pressButton(driver, `~${testIDs['home-share']}`)
	await pressButton(driver, `~${testIDs['invite-button']}`)
	await pressButton(driver, '//XCUIElementTypeButton[@name="Copy"]') // native element in share modal that is copy button
	await swipeElement(driver, '//XCUIElementTypeNavigationBar[@name="Berty"]') // native element in navigation modal corresponding to the top part

	const clipboard = await getClipboard(driver)

	return clipboard.substring(clipboard.indexOf('https://berty.tech'))
}

module.exports = {
	shareAccount,
}
