const androidScrollIntoView = (driver, label) => {
	// this is black magic to scroll an element into view on android
	driver.$(
		`android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().description("${label}"))`,
	)
}

const waitForElementByAccessibilityId = async (driver, label, timeout = 5 * 60 * 1000) => {
	const getElem = () => driver.$(`~${label}`)
	await driver.waitUntil(() => getElem().isDisplayed(), { timeout, interval: 1000 })
	return getElem()
}

const pressButton = async (driver, label, timeout) => {
	const button = await waitForElementByAccessibilityId(driver, label, timeout)
	await button.click()
}

const setInputValue = async (driver, label, value, timeout) => {
	const input = await waitForElementByAccessibilityId(driver, label, timeout)
	await input.setValue(value)
}

const getCapabilitiesFromEnv = () => {
	const platform = process.env.IOS_APP ? 'iOS' : 'Android'

	const app = process.env.IOS_APP || process.env.ANDROID_APP
	if (!app) {
		throw new Error('no app provided')
	}

	switch (platform) {
		case 'iOS':
			return {
				platformName: 'iOS',
				platformVersion: process.env.IOS_VERSION || '15.5',
				deviceName: process.env.IOS_DEVICE || 'iPhone 11',
				app,
				automationName: 'XCUITest', // UiAutomator2, Espresso, or UiAutomator1 for Android,
				simulatorStartupTimeout: 600000,
			}
		case 'Android':
			return {
				platformName: 'Android',
				// platformVersion: '8',
				deviceName: 'Android Emulator',
				app,
				appPackage: 'tech.berty.android.debug',
				appActivity: 'tech.berty.android.MainActivity',
				automationName: 'UiAutomator2',
			}
		default:
			throw new Error(`usupported platform: ${platform}`)
	}
}

module.exports = {
	androidScrollIntoView,
	waitForElementByAccessibilityId,
	pressButton,
	setInputValue,
	getCapabilitiesFromEnv,
}
