const androidScrollIntoView = (driver, label) => {
	// this is black magic to scroll an element into view on android
	driver.$(
		`android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().description("${label}"))`,
	)
}

const waitForElementByAccessibilityId = async (driver, label, timeout = 30 * 1000) => {
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

	const timeout = 60 * 60 * 1000

	switch (platform) {
		case 'iOS':
			return {
				platformName: 'iOS',
				'appium:platformVersion': process.env.IOS_VERSION || '15.5',
				'appium:deviceName': process.env.IOS_DEVICE || 'iPhone 11',
				'appium:app': app,
				'appium:automationName': 'XCUITest', // UiAutomator2, Espresso, or UiAutomator1 for Android,
				'appium:simulatorStartupTimeout': timeout,
				'appium:wdaLaunchTimeout': timeout,
				'appium:wdaConnectionTimeout': timeout,
				'appium:wdaStartupRetries': 4,
			}
		case 'Android':
			return {
				platformName: 'Android',
				// platformVersion: '8',
				'appium:deviceName': 'Android Emulator',
				'appium:app': app,
				'appium:appPackage': 'tech.berty.android.debug',
				'appium:appActivity': 'tech.berty.android.MainActivity',
				'appium:automationName': 'UiAutomator2',
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
