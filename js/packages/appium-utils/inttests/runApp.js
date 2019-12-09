const assert = require('assert')
const { TestContext } = require('..')

/* eslint-env mocha */
/* global browser */

describe('App', function() {
	const elemId = 'TestElem'
	it(`should run and display something with ${elemId} as test id`, async function() {
		const ctx = new TestContext(browser)
		const ret = await ctx.findElem(elemId)
		console.log('got:', ret)
		assert.ifError(ret.error)
	})
})
