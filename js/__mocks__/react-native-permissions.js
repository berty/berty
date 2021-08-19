export const RESULTS = Object.freeze({
	UNAVAILABLE: 'unavailable',
	BLOCKED: 'blocked',
	DENIED: 'denied',
	GRANTED: 'granted',
	LIMITED: 'limited',
})

export const PERMISSIONS = Object.freeze({
	ANDROID: {},
	IOS: {},
	WINDOWS: {},
})

export const openLimitedPhotoLibraryPicker = jest.fn(async () => {})
export const openSettings = jest.fn(async () => {})
export const check = jest.fn(async permission => RESULTS.GRANTED)
export const request = jest.fn(async permission => RESULTS.GRANTED)
export const checkLocationAccuracy = jest.fn(async () => 'full')
export const requestLocationAccuracy = jest.fn(async options => 'full')

const notificationOptions = ['alert', 'badge', 'sound', 'carPlay', 'criticalAlert', 'provisional']

const notificationSettings = {
	alert: true,
	badge: true,
	sound: true,
	carPlay: true,
	criticalAlert: true,
	provisional: true,
	lockScreen: true,
	notificationCenter: true,
}

export const checkNotifications = jest.fn(async () => ({
	status: RESULTS.GRANTED,
	settings: notificationSettings,
}))

export const requestNotifications = jest.fn(async options => ({
	status: RESULTS.GRANTED,
	settings: options
		.filter(option => notificationOptions.includes(option))
		.reduce((acc, option) => ({ ...acc, [option]: true }), {
			lockScreen: true,
			notificationCenter: true,
		}),
}))

export const checkMultiple = jest.fn(async permissions =>
	permissions.reduce((acc, permission) => ({
		...acc,
		[permission]: RESULTS.GRANTED,
	})),
)

export const requestMultiple = jest.fn(async permissions =>
	permissions.reduce((acc, permission) => ({
		...acc,
		[permission]: RESULTS.GRANTED,
	})),
)

export default {
	PERMISSIONS,
	RESULTS,

	check,
	checkLocationAccuracy,
	checkMultiple,
	checkNotifications,
	openLimitedPhotoLibraryPicker,
	openSettings,
	request,
	requestLocationAccuracy,
	requestMultiple,
	requestNotifications,
}
