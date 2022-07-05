const wdio = require('webdriverio')

const sleep = timeout => new Promise(resolve => setTimeout(resolve, timeout))

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

const waitForElementByText = async (driver, text, timeout = 30 * 1000) => {
	const getElem = () => driver.findElement('xpath', "//*[@text='" + text + "']")
	await driver.waitUntil(
		async () => {
			const elem = await getElem()
			return elem && !elem.error
		},
		{ timeout, interval: 1000 },
	)
	return await driver.$(await getElem())
}

const pressButton = async (driver, label, timeout) => {
	const button = await waitForElementByAccessibilityId(driver, label, timeout)
	await button.click()
}

const pressButtonByText = async (driver, text, timeout) => {
	let button = await waitForElementByText(driver, text, timeout)
	await button.click()
}

const setInputValue = async (driver, label, value, timeout) => {
	const input = await waitForElementByAccessibilityId(driver, label, timeout)
	await input.setValue(value)
}

const getConfigFromEnv = () => {
	const selectedPlatform = process.env.TESTING_PLATFORM || 'none'

	const platforms = {}

	const iOSApp = process.env.IOS_APP
	if (selectedPlatform === 'iOS' && !iOSApp) {
		throw new Error('missing IOS_APP environment variable')
	}
	if (iOSApp) {
		platforms.iOS = {
			platformName: 'iOS',
			platformVersion: process.env.IOS_VERSION || '15.5',
			deviceName: process.env.IOS_DEVICE || 'iPhone 11',
			app: iOSApp,
			automationName: 'XCUITest', // UiAutomator2, Espresso, or UiAutomator1 for Android,
			simulatorStartupTimeout: 10 * 60 * 1000,
			wdaLaunchTimeout: 10 * 60 * 1000,
			wdaConnectionTimeout: 10 * 60 * 1000,
		}
	}

	const android = {
		platformName: 'Android',
		// platformVersion: '8',
		deviceName: 'Android Emulator',
		automationName: 'UiAutomator2',
		appPackage: process.env.ANDROID_PACKAGE || 'tech.berty.android',
		appActivity: process.env.ANDROID_ACTIVITY || 'tech.berty.android.MainActivity',
		androidInstallTimeout: 5 * 60 * 1000,
		adbExecTimeout: 2 * 60 * 1000,
	}
	const androidApp = process.env.ANDROID_APP
	if (androidApp) {
		android.app = androidApp
	}

	platforms.Android = android

	if (selectedPlatform !== 'none') {
		switch (selectedPlatform) {
			case 'iOS':
				platforms.selected = platforms.iOS
				break
			case 'Android':
				platforms.selected = platforms.Android
				break
			default:
				throw new Error(`unknown platform '${selectedPlatform}', available: Android, iOS`)
		}
	}

	return platforms
}

const createDriver = capabilities =>
	wdio.remote({
		path: '/wd/hub',
		port: 4723,
		capabilities,
	})

const createAccount = async driver => {
	await pressButton(driver, 'Create an account')
	await pressButton(driver, 'Default mode')
	await pressButton(driver, "Let's go")

	switch (driver.capabilities.platformName) {
		case 'iOS':
			await pressButton(driver, 'SKIP')
			await pressButton(driver, 'Continue')
			break
		case 'Android':
			// Android API 33 requires user to accept notification permission
			if (driver.capabilities.deviceApiLevel >= 33) {
				await pressButtonByText(driver, 'SKIP') // skip push notif perm request
				await pressButtonByText(driver, 'CONTINUE')
			}
			break
		default:
			throw new Error(`platform '${driver.capabilities.platform}' not supported`)
	}

	await sleep(1 * 1000)
	await pressButton(driver, 'Start using berty')
}

const joinGroupFromHome = async (driver, link) => {
	await setInputValue(driver, 'Search keyword', link)
	await pressButton(driver, 'Open Berty Link')
	await pressButton(driver, 'Join this group')
	await sleep(1 * 1000)
}

module.exports = {
	androidScrollIntoView,
	waitForElementByAccessibilityId,
	pressButton,
	pressButtonByText,
	setInputValue,
	getConfigFromEnv,
	waitForElementByText,
	createDriver,
	createAccount,
	joinGroupFromHome,
	sleep,
}
