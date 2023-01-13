const wdio = require('webdriverio')

const { getAndroidCapabilities } = require('./lib')

const androidList = ['Pixel_3_XL_API_29']

async function initializeDriver(deviceName, port) {
	return await wdio.remote({
		port: 4723,
		capabilities: { ...getAndroidCapabilities(deviceName), 'appium:wdaLocalPort': port },
	})
}

async function getAndroidDrivers(numberOfDevices = 1) {
	if (numberOfDevices > androidList.length) {
		throw new Error('Too many devices')
	}

	const drivers = []
	let port = 8110

	for (let i = 0; i < numberOfDevices; i++) {
		drivers.push(await initializeDriver(androidList[i], port))
		port++
	}

	return drivers
}

module.exports = {
	androidList,
	getAndroidDrivers,
}
