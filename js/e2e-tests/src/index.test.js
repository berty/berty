const { getIOSDrivers } = require('./lib/iosDriver')
const {
	addContactAndSendOneToOneMessage,
} = require('./tests/2-simulators/addContactAndSendOneToOneMessage')
const { joinGroupAndSendMessage } = require('./tests/2-simulators/joinGroupAndSendMessage')
const { createAccount } = require('./utils/createAccount')

jest.setTimeout(600000)

const DEVICES_NEEDED = 2

let drivers

beforeEach(async () => {
	drivers = await getIOSDrivers(DEVICES_NEEDED)

	if (drivers.length < DEVICES_NEEDED) {
		throw new Error('Not enough devices')
	}

	return await Promise.all(drivers.map(createAccount))
})

afterEach(async () => {
	return await Promise.all(drivers.map(async driver => await driver.deleteSession()))
})

test('2 ios join a group and send a message in the group', async () => {
	await expect(joinGroupAndSendMessage(drivers)).resolves.not.toThrow()
})

test('2 ios add each other and send a message in a 1-to-1 conv', async () => {
	await expect(addContactAndSendOneToOneMessage(drivers)).resolves.not.toThrow()
})
