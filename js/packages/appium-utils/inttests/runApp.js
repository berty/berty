const assert = require('assert')
const { TestContext } = require('..')

/* eslint-env mocha */
/* global browser */

describe('App', function() {
	it('should run and display something with "Body" as test id', async function() {
		const ctx = new TestContext(browser)
		const ret = await ctx.findElem('Navigation')
		console.log('got:', ret)
		assert.ifError(ret.error)
	})
})
