'use strict'

function testIdsEnabled() {
	const r = !!(process && process.env && process.env.ENABLE_TEST_IDS)
	//console.log(r)
	return r
}

function testId(val) {
	// with terser this should be optimized out in prod
	return testIdsEnabled() ? { accessibilityLabel: val, testID: val } : {}
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
