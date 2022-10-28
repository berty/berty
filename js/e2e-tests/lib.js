require('dotenv').config()

const androidScrollIntoView = (driver, label) => {
	// this is black magic to scroll an element into view on android
	driver.$(
		`android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().description("${label}"))`,
	)
}

const waitForElementByAccessibilityId = async (driver, label, timeout = 30 * 1000) => {
	const elem = await driver.$(`~${label}`)

	await elem.waitForDisplayed({ timeout })

	return elem
}

const pressButton = async (driver, label, timeout) => {
	const button = await waitForElementByAccessibilityId(driver, label, timeout)
	await button.click()
}

const setInputValue = async (driver, label, value, timeout) => {
	const input = await waitForElementByAccessibilityId(driver, label, timeout)
	await input.setValue(value)
}

const getTextInElement = async (driver, label) => {
	const elem = await waitForElementByAccessibilityId(driver, label)
	return await elem.getText()
}

const getCapabilitiesFromEnv = deviceName => {
	const platform = process.env.IOS_APP ? 'iOS' : 'Android'
	const timeout = 20 * 60 * 1000
	const app = process.env.IOS_APP || process.env.ANDROID_APP

	if (!app) {
		throw new Error('no app provided')
	}

	const timeout = 60 * 60 * 1000

	switch (platform) {
		case 'iOS':
			return {
				// https://github.com/appium/appium-xcuitest-driver#desired-capabilities
				platformName: 'iOS',
				'appium:platformVersion': process.env.IOS_VERSION || '15.5',
				'appium:deviceName': process.env.IOS_DEVICE || 'iPhone 11',
				'appium:app': app,
				'appium:automationName': 'XCUITest', // UiAutomator2, Espresso, or UiAutomator1 for Android,
				'appium:simulatorStartupTimeout': timeout,
				'appium:wdaLaunchTimeout': timeout,
				'appium:wdaConnectionTimeout': timeout,
				'appium:maxTypingFrequency': process.env.MAX_TYPING_FREQUENCY,
				'appium:wdaStartupRetries': 4,
				'appium:snapshotMaxDepth': 1000,
				// 'appium:noReset': true,
				// 'appium:fullReset': false,
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
			throw new Error(`unsupported platform: ${platform}`)
	}
}

module.exports = {
	androidScrollIntoView,
	pressButton,
	setInputValue,
	getCapabilitiesFromEnv,
	getTextInElement,
}
