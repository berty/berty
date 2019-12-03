'use strict'

const getenv = require('getenv')

function testIdsEnabled() {
	return getenv.bool('ENABLE_TEST_IDS', false)
}

function testId(val) {
	// with terser this should be optimized out in prod
	return testIdsEnabled() ? { accessibilityLabel: val } : {}
}

class TestContext {
	constructor(client) {
		this.client = client
	}
	findElem(testId) {
		return this.client.findElement('accessibility id', testId)
	}
}

module.exports = {
	testId,
	TestContext,
	testIdsEnabled,
}
