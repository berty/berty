const { getAndroidDrivers } = require('./lib/androidDriver')
const { getIOSDrivers, iphoneList } = require('./lib/iosDriver')
const {
	addContactAndSendOneToOneMessage,
} = require('./tests/2-simulators/addContactAndSendOneToOneMessage')
const { joinGroupAndSendMessage } = require('./tests/2-simulators/joinGroupAndSendMessage')
const { createAccount } = require('./utils/createAccount')

jest.setTimeout(600000)

const DEVICES_NEEDED = 1

let drivers

beforeEach(async () => {
	const androidDriver = await getAndroidDrivers(DEVICES_NEEDED)
	const iosDriver = await getIOSDrivers(DEVICES_NEEDED)

	if (iosDriver.length < DEVICES_NEEDED || androidDriver.length < DEVICES_NEEDED) {
		throw new Error('Not enough devices')
	}

	drivers = iosDriver.concat(androidDriver)

	return await Promise.all(drivers.map(createAccount))
})

afterEach(async () => {
	return await Promise.all(drivers.map(async driver => await driver.deleteSession()))
})

test('1 ios and 1 android join a group and send a message in the group', async () => {
	await expect(
		joinGroupAndSendMessage(drivers, 'Android SDK built for x86', iphoneList[0]),
	).resolves.not.toThrow()
})

test('1 ios and 1 android add each other and send a message in a 1-to-1 conv', async () => {
	await expect(addContactAndSendOneToOneMessage(drivers)).resolves.not.toThrow()
})
