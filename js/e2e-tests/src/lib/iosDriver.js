const wdio = require('webdriverio')

const { getIosCapabilities } = require('./lib')

const iphoneList = [
	'iPhone 11',
	'iPhone 11 Pro',
	'iPhone 11 Pro Max',
	'iPhone 12',
	'iPhone 12 Pro',
	'iPhone 12 Pro Max',
	'iPhone 12 mini',
]

async function initializeDriver(deviceName, port) {
	return await wdio.remote({
		port: 4723,
		capabilities: { ...getIosCapabilities(deviceName), 'appium:wdaLocalPort': port },
	})
}

async function getIOSDrivers(numberOfDevices = 1) {
	if (numberOfDevices > iphoneList.length) {
		throw new Error('Too many devices')
	}

	const drivers = []
	let port = 8100

	for (let i = 0; i < numberOfDevices; i++) {
		drivers.push(await initializeDriver(iphoneList[i], port))
		port++
	}

	return drivers
}

module.exports = {
	iphoneList,
	getIOSDrivers,
}
