require('dotenv').config()

const androidScrollIntoView = (driver, label) => {
	// this is black magic to scroll an element into view on android
	driver.$(
		`android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().description("${label}"))`,
	)
}

const waitForElement = async (driver, label, timeout = 30 * 1000) => {
	const elem = await driver.$(label)

	await elem.waitForDisplayed({ timeout })

	return elem
}

const pressButton = async (driver, label, timeout) => {
	const button = await waitForElement(driver, label, timeout)
	await button.click()
}

const setInputValue = async (driver, label, value, timeout) => {
	const input = await waitForElement(driver, label, timeout)
	await input.setValue(value)
}

const getTextInElement = async (driver, label) => {
	const elem = await waitForElement(driver, label)
	return await elem.getText()
}

const getAndroidCapabilities = deviceName => {
	const app = process.env.ANDROID_APP

	if (!app) {
		throw new Error('no app provided')
	}

	return {
		platformName: 'Android',
		// platformVersion: '8',
		deviceName,
		app,
		appPackage: 'tech.berty.android.debug',
		appActivity: 'tech.berty.android.MainActivity',
		automationName: 'UiAutomator2',
	}
}

const getIosCapabilities = deviceName => {
	const app = process.env.IOS_APP
	const timeout = 20 * 60 * 1000

	if (!app) {
		throw new Error('no app provided')
	}

	return {
		// https://github.com/appium/appium-xcuitest-driver#desired-capabilities
		platformName: 'iOS',
		'appium:platformVersion': process.env.IOS_VERSION || '15.5',
		'appium:deviceName': deviceName || process.env.IOS_DEVICE || 'iPhone 11',
		'appium:app': app,
		'appium:automationName': 'XCUITest', // UiAutomator2, Espresso, or UiAutomator1 for Android,
		'appium:simulatorStartupTimeout': timeout,
		'appium:wdaLaunchTimeout': timeout,
		'appium:wdaConnectionTimeout': timeout,
		'appium:maxTypingFrequency': process.env.MAX_TYPING_FREQUENCY,
	}
}

const getClipboard = async driver => {
	const clipboard = await driver.getClipboard()

	// eslint-disable-next-line no-undef
	const buff = Buffer.from(clipboard, 'base64')

	return buff.toString('utf-8')
}

const swipeElement = async (driver, label, direction = 'down') => {
	const element = await waitForElement(driver, label)

	await driver.execute('mobile: swipe', {
		direction,
		element,
	})
}

const getElementLocation = async (driver, label) => {
	const element = await waitForElement(driver, label)

	return await element.getLocation()
}

const backgroundApp = async driver => {
	const result = await driver.terminateApp('tech.berty.ios.debug')

	if (!result) {
		throw new Error('could not background app')
	}
}

const foregroundApp = async driver => {
	await driver.activateApp('tech.berty.ios.debug')
}

module.exports = {
	androidScrollIntoView,
	pressButton,
	setInputValue,
	getAndroidCapabilities,
	getIosCapabilities,
	getTextInElement,
	getClipboard,
	swipeElement,
	getElementLocation,
	backgroundApp,
	foregroundApp,
}
