const wdio = require('webdriverio')
const assert = require('assert')
const buildProject = require('./buildProject')
const { TestContext } = require('..')

const buildProj = () => {
	const xcodeProject = { name: 'Berty.xcodeproj' }
	const udid = '3A87D5D2-2E22-430C-A643-292B77BB1565' //
	const scheme = 'Berty'
	const args = { configuration: 'Debug' }

	buildProject(xcodeProject, udid, scheme, args)
}

async function main() {
	const client = await wdio.remote({
		port: 4723,
		capabilities: {
			automationName: 'XCUITest',
			platformName: 'iOS',
			platformVersion: '12.2',
			deviceName: 'iPhone X',
			bundleId: 'chat.berty.ios',
		},
	})
	console.log('client', client)

	const ctx = new TestContext(client)

	const body = await ctx.findElem('Body')
	console.log('got body:', body)
	assert(body)

	await client.deleteSession()
}

main()
