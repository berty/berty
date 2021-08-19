/**
 * @format
 */

const asMock = {
	__INTERNAL_MOCK_STORAGE__: {},

	setItem: jest.fn(async (key, value, callback) => {
		const setResult = await asMock.multiSet([[key, value]], undefined)

		callback && callback(setResult)
		return setResult
	}),

	getItem: jest.fn(async (key, callback) => {
		const getResult = await asMock.multiGet([key], undefined)

		const result = getResult[0] ? getResult[0][1] : null

		callback && callback(null, result)
		return result
	}),

	removeItem: jest.fn((key, callback) => asMock.multiRemove([key], callback)),
	mergeItem: jest.fn((key, value, callback) => asMock.multiMerge([[key, value]], callback)),

	clear: jest.fn(_clear),
	getAllKeys: jest.fn(_getAllKeys),
	flushGetRequests: jest.fn(),

	multiGet: jest.fn(_multiGet),
	multiSet: jest.fn(_multiSet),
	multiRemove: jest.fn(_multiRemove),
	multiMerge: jest.fn(_multiMerge),
	useAsyncStorage: jest.fn(key => {
		return {
			getItem: (...args) => asMock.getItem(key, ...args),
			setItem: (...args) => asMock.setItem(key, ...args),
			mergeItem: (...args) => asMock.mergeItem(key, ...args),
			removeItem: (...args) => asMock.removeItem(key, ...args),
		}
	}),
}

async function _multiSet(keyValuePairs, callback) {
	keyValuePairs.forEach(keyValue => {
		const key = keyValue[0]

		asMock.__INTERNAL_MOCK_STORAGE__[key] = keyValue[1]
	})
	callback && callback(null)
	return null
}

async function _multiGet(keys, callback) {
	const values = keys.map(key => [key, asMock.__INTERNAL_MOCK_STORAGE__[key] || null])
	callback && callback(null, values)

	return values
}

async function _multiRemove(keys, callback) {
	keys.forEach(key => {
		if (asMock.__INTERNAL_MOCK_STORAGE__[key]) {
			delete asMock.__INTERNAL_MOCK_STORAGE__[key]
		}
	})

	callback && callback(null)
	return null
}

async function _clear(callback) {
	asMock.__INTERNAL_MOCK_STORAGE__ = {}

	callback && callback(null)

	return null
}

async function _getAllKeys() {
	return Object.keys(asMock.__INTERNAL_MOCK_STORAGE__)
}

async function _multiMerge(keyValuePairs, callback) {
	keyValuePairs.forEach(keyValue => {
		const key = keyValue[0]
		const value = JSON.parse(keyValue[1])

		const oldValue = JSON.parse(asMock.__INTERNAL_MOCK_STORAGE__[key])

		asMock.__INTERNAL_MOCK_STORAGE__[key] = JSON.stringify(_deepMergeInto(oldValue, value))
	})

	callback && callback(null)
	return null
}

const _isObject = obj => typeof obj === 'object' && !Array.isArray(obj)
const _deepMergeInto = (oldObject, newObject) => {
	const newKeys = Object.keys(newObject)
	const mergedObject = oldObject

	newKeys.forEach(key => {
		const oldValue = mergedObject[key]
		const newValue = newObject[key]

		if (_isObject(oldValue) && _isObject(newValue)) {
			mergedObject[key] = _deepMergeInto(oldValue, newValue)
		} else {
			mergedObject[key] = newValue
		}
	})

	return mergedObject
}

module.exports = asMock
