/**
 * @format
 */

import 'react-native'
import React from 'react'
import App from './App'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

jest.useFakeTimers()

jest.mock('@react-native-community/async-storage', () => {
	let store: any = {}
	return {
		setItem: jest.fn(async (key, value) => {
			store[key] = value
		}),
		clear: jest.fn(async () => {
			store = {}
		}),
		getItem: jest.fn(async (key) => store[key]),
	}
})

jest.mock('react-native-permissions', () => {
	const ANDROID = Object.freeze({
		ACCEPT_HANDOVER: 'android.permission.ACCEPT_HANDOVER' as const,
		ACCESS_BACKGROUND_LOCATION: 'android.permission.ACCESS_BACKGROUND_LOCATION' as const,
		ACCESS_COARSE_LOCATION: 'android.permission.ACCESS_COARSE_LOCATION' as const,
		ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION' as const,
		ACTIVITY_RECOGNITION: 'android.permission.ACTIVITY_RECOGNITION' as const,
		ADD_VOICEMAIL: 'com.android.voicemail.permission.ADD_VOICEMAIL' as const,
		ANSWER_PHONE_CALLS: 'android.permission.ANSWER_PHONE_CALLS' as const,
		BODY_SENSORS: 'android.permission.BODY_SENSORS' as const,
		CALL_PHONE: 'android.permission.CALL_PHONE' as const,
		CAMERA: 'android.permission.CAMERA' as const,
		GET_ACCOUNTS: 'android.permission.GET_ACCOUNTS' as const,
		PROCESS_OUTGOING_CALLS: 'android.permission.PROCESS_OUTGOING_CALLS' as const,
		READ_CALENDAR: 'android.permission.READ_CALENDAR' as const,
		READ_CALL_LOG: 'android.permission.READ_CALL_LOG' as const,
		READ_CONTACTS: 'android.permission.READ_CONTACTS' as const,
		READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE' as const,
		READ_PHONE_NUMBERS: 'android.permission.READ_PHONE_NUMBERS' as const,
		READ_PHONE_STATE: 'android.permission.READ_PHONE_STATE' as const,
		READ_SMS: 'android.permission.READ_SMS' as const,
		RECEIVE_MMS: 'android.permission.RECEIVE_MMS' as const,
		RECEIVE_SMS: 'android.permission.RECEIVE_SMS' as const,
		RECEIVE_WAP_PUSH: 'android.permission.RECEIVE_WAP_PUSH' as const,
		RECORD_AUDIO: 'android.permission.RECORD_AUDIO' as const,
		SEND_SMS: 'android.permission.SEND_SMS' as const,
		USE_SIP: 'android.permission.USE_SIP' as const,
		WRITE_CALENDAR: 'android.permission.WRITE_CALENDAR' as const,
		WRITE_CALL_LOG: 'android.permission.WRITE_CALL_LOG' as const,
		WRITE_CONTACTS: 'android.permission.WRITE_CONTACTS' as const,
		WRITE_EXTERNAL_STORAGE: 'android.permission.WRITE_EXTERNAL_STORAGE' as const,
	})

	const IOS = Object.freeze({
		APP_TRACKING_TRANSPARENCY: 'ios.permission.APP_TRACKING_TRANSPARENCY' as const,
		BLUETOOTH_PERIPHERAL: 'ios.permission.BLUETOOTH_PERIPHERAL' as const,
		CALENDARS: 'ios.permission.CALENDARS' as const,
		CAMERA: 'ios.permission.CAMERA' as const,
		CONTACTS: 'ios.permission.CONTACTS' as const,
		FACE_ID: 'ios.permission.FACE_ID' as const,
		LOCATION_ALWAYS: 'ios.permission.LOCATION_ALWAYS' as const,
		LOCATION_WHEN_IN_USE: 'ios.permission.LOCATION_WHEN_IN_USE' as const,
		MEDIA_LIBRARY: 'ios.permission.MEDIA_LIBRARY' as const,
		MICROPHONE: 'ios.permission.MICROPHONE' as const,
		MOTION: 'ios.permission.MOTION' as const,
		PHOTO_LIBRARY: 'ios.permission.PHOTO_LIBRARY' as const,
		REMINDERS: 'ios.permission.REMINDERS' as const,
		SIRI: 'ios.permission.SIRI' as const,
		SPEECH_RECOGNITION: 'ios.permission.SPEECH_RECOGNITION' as const,
		STOREKIT: 'ios.permission.STOREKIT' as const,
	})

	const PERMISSIONS = Object.freeze({ ANDROID, IOS })

	const RESULTS = Object.freeze({
		UNAVAILABLE: 'unavailable' as const,
		DENIED: 'denied' as const,
		BLOCKED: 'blocked' as const,
		GRANTED: 'granted' as const,
	})

	const openSettings = jest.fn(async () => {})
	const check = jest.fn(async () => RESULTS.GRANTED)
	const request = jest.fn(async () => RESULTS.GRANTED)

	const notificationOptions = [
		'alert',
		'badge',
		'sound',
		'criticalAlert',
		'carPlay',
		// 'provisional', // excluded as it's not included in NotificationSettings
	]

	const notificationSettings = {
		alert: true,
		badge: true,
		sound: true,
		carPlay: true,
		criticalAlert: true,
		lockScreen: true,
		notificationCenter: true,
	}

	const checkNotifications = jest.fn(async () => ({
		status: RESULTS.GRANTED,
		settings: notificationSettings,
	}))

	const requestNotifications = jest.fn(async (options) => ({
		status: RESULTS.GRANTED,
		settings: options
			.filter((option: any) => notificationOptions.includes(option))
			.reduce((acc: any, option: any) => ({ ...acc, [option]: true }), {
				lockScreen: true,
				notificationCenter: true,
			}),
	}))

	const checkMultiple = jest.fn(async (permissions) =>
		permissions.reduce((acc: any, permission: any) => ({
			...acc,
			[permission]: RESULTS.GRANTED,
		})),
	)

	const requestMultiple = jest.fn(async (permissions) =>
		permissions.reduce((acc: any, permission: any) => ({
			...acc,
			[permission]: RESULTS.GRANTED,
		})),
	)

	return {
		PERMISSIONS,
		RESULTS,
		openSettings,
		check,
		request,
		checkNotifications,
		requestNotifications,
		checkMultiple,
		requestMultiple,
	}
})

jest.mock('react-native-reanimated', () => {
	const React = require('react')
	const { View, Text, Image, Animated, Platform } = require('react-native')

	function NOOP() {}

	function simulateCallbackFactory(...params: any[]) {
		return (callback: any) => {
			callback &&
				setTimeout(() => {
					callback(...params)
				}, 0)
		}
	}

	class Code extends React.Component {
		render() {
			return null
		}
	}

	const getValue = (node: any) => {
		if (typeof node === 'number') {
			return node
		}
		return (node && node[' __value']) || 0
	}

	class AnimatedValue {
		' __value': any

		constructor(val: any) {
			this[' __value'] = val
		}

		setValue(val: any) {
			this[' __value'] = val
		}

		interpolate() {
			return this
		}
	}

	function createMockComponent(name: any) {
		return class extends React.Component {
			static displayName = name

			render() {
				return this.props.children
			}
		}
	}

	function createTransitioningComponent(Component: any) {
		return class extends React.Component {
			static displayName = `Transitioning.${Component.displayName || Component.name || 'Component'}`

			setNativeProps() {}

			animateNextTransition() {}

			render() {
				return <Component {...this.props} />
			}
		}
	}

	const Reanimated = {
		SpringUtils: {
			makeDefaultConfig: NOOP,
			makeConfigFromBouncinessAndSpeed: NOOP,
			makeConfigFromOrigamiTensionAndFriction: NOOP,
		},

		View,
		Text,
		Image,
		ScrollView: Animated.ScrollView,
		Code,

		Clock: NOOP,
		Node: NOOP,
		Value: AnimatedValue,

		EasingNode: {
			linear: NOOP,
			ease: NOOP,
			quad: NOOP,
			cubic: NOOP,
			poly: () => NOOP,
			sin: NOOP,
			circle: NOOP,
			exp: NOOP,
			elastic: () => NOOP,
			back: () => NOOP,
			bounce: () => NOOP,
			bezier: () => NOOP,
			in: () => NOOP,
			out: () => NOOP,
			inOut: () => NOOP,
		},

		Extrapolate: {
			EXTEND: 'extend',
			CLAMP: 'clamp',
			IDENTITY: 'identity',
		},

		add: (...vals: any[]) =>
			new AnimatedValue(vals.map((v) => getValue(v)).reduce((acc, v) => acc + v)),
		sub: (...vals: any[]) =>
			new AnimatedValue(vals.map((v) => getValue(v)).reduce((acc, v) => acc - v)),
		divide: (...vals: any[]) =>
			new AnimatedValue(vals.map((v) => getValue(v)).reduce((acc, v) => acc / v)),
		multiply: (...vals: any[]) =>
			new AnimatedValue(vals.map((v) => getValue(v)).reduce((acc, v) => acc * v)),
		pow: (...vals: any[]) =>
			new AnimatedValue(vals.map((v) => getValue(v)).reduce((acc, v) => acc ** v)),
		modulo: (a: any, b: any) => new AnimatedValue(getValue(a) % getValue(b)),
		sqrt: (a: any) => new AnimatedValue(Math.sqrt(getValue(a))),
		log: (a: any) => new AnimatedValue(Math.log(getValue(a))),
		sin: (a: any) => new AnimatedValue(Math.sin(getValue(a))),
		cos: (a: any) => new AnimatedValue(Math.cos(getValue(a))),
		tan: (a: any) => new AnimatedValue(Math.tan(getValue(a))),
		acos: (a: any) => new AnimatedValue(Math.acos(getValue(a))),
		asin: (a: any) => new AnimatedValue(Math.asin(getValue(a))),
		atan: (a: any) => new AnimatedValue(Math.atan(getValue(a))),
		exp: (a: any) => new AnimatedValue(Math.exp(getValue(a))),
		round: (a: any) => new AnimatedValue(Math.round(getValue(a))),
		floor: (a: any) => new AnimatedValue(Math.floor(getValue(a))),
		ceil: (a: any) => new AnimatedValue(Math.ceil(getValue(a))),
		lessThan: (a: any, b: any) => new AnimatedValue(getValue(a) < getValue(b)),
		eq: (a: any, b: any) => new AnimatedValue(getValue(a) === getValue(b)),
		greaterThan: (a: any, b: any) => new AnimatedValue(getValue(a) > getValue(b)),
		lessOrEq: (a: any, b: any) => new AnimatedValue(getValue(a) <= getValue(b)),
		greaterOrEq: (a: any, b: any) => new AnimatedValue(getValue(a) >= getValue(b)),
		neq: (a: any, b: any) => new AnimatedValue(getValue(a) !== getValue(b)),
		and: (a: any, b: any) => new AnimatedValue(getValue(a) && getValue(b)),
		or: (a: any, b: any) => new AnimatedValue(getValue(a) || getValue(b)),
		defined: (a: any) => new AnimatedValue(getValue(a) !== null && getValue(a) !== undefined),
		not: (a: any) => new AnimatedValue(!getValue(a)),
		set: (a: any, b: any) => {
			a.setValue(getValue(b))
			return a
		},
		concat: (a: any, b: any) => `${a}${b}`,
		cond: (a: any, b: any, c: any) => {
			if (getValue(a)) {
				return b
			} else {
				return c
			}
		},
		block: (a: any) => a[a.length - 1],
		call: (a: any, b: any) => b(a.map(getValue)),
		debug: NOOP,
		onChange: NOOP,
		startClock: NOOP,
		stopClock: NOOP,
		clockRunning: NOOP,
		event: NOOP,
		abs: (a: any) => Math.abs(getValue(a)),
		acc: NOOP,
		color: (r: any, g: any, b: any, a: any = 1) => {
			const color =
				16777216 * Math.round(getValue(a) * 255) +
				65536 * getValue(r) +
				256 * getValue(g) +
				getValue(b)
			if (Platform.OS === 'android') {
				// on Android color is represented as signed 32 bit int
				if (color < (1 << 31) >>> 0) {
					return new AnimatedValue(color)
				}
				return new AnimatedValue(color - 2 ** 32)
			}
			return new AnimatedValue(color)
		},
		diff: NOOP,
		diffClamp: NOOP,
		interpolateNode: NOOP,
		max: (a: any, b: any) => Math.max(getValue(a), getValue(b)),
		min: (a: any, b: any) => Math.min(getValue(a), getValue(b)),

		decay: () => ({
			start: simulateCallbackFactory({ finished: true }),
			stop: simulateCallbackFactory({ finished: true }),
		}),
		timing: () => ({
			start: simulateCallbackFactory({ finished: true }),
			stop: simulateCallbackFactory({ finished: true }),
		}),
		spring: () => ({
			start: simulateCallbackFactory({ finished: true }),
			stop: simulateCallbackFactory({ finished: true }),
		}),

		proc: (cb: any) => cb,

		useCode: NOOP,
		createAnimatedComponent: (Component: any) => Component,
	}

	return {
		__esModule: true,

		...Reanimated,

		default: Reanimated,

		Transitioning: {
			View: createTransitioningComponent(View),
		},

		Transition: {
			Sequence: createMockComponent('Transition.Sequence'),
			Together: createMockComponent('Transition.Together'),
			In: createMockComponent('Transition.In'),
			Out: createMockComponent('Transition.Out'),
			Change: createMockComponent('Transition.Change'),
		},

		createTransitioningComponent,
	}
})

jest.mock('react-native-gesture-handler', () => {
	const { View, ScrollView } = require('react-native')

	return {
		ScrollView,
		PanGestureHandler: View,
		attachGestureHandler: () => {},
		createGestureHandler: () => {},
		dropGestureHandler: () => {},
		updateGestureHandler: () => {},
		Direction: {
			RIGHT: 1,
			LEFT: 2,
			UP: 4,
			DOWN: 8,
		},
		State: {
			BEGAN: 'BEGAN',
			FAILED: 'FAILED',
			ACTIVE: 'ACTIVE',
			END: 'END',
			UNDETERMINED: 'UNDETERMINED',
		},
	}
})

jest.mock('react-native-screens', () => {
	const View = require('react-native').View

	const enableScreens = jest.fn()
	const ScreenContainer = View
	const Screen = View
	const NativeScreen = View
	const NativeScreenContainer = View
	const ScreenStack = View
	const ScreenStackHeaderConfig = View
	const ScreenStackHeaderSubview = View
	const ScreenStackHeaderRightView = View
	const ScreenStackHeaderLeftView = View
	const ScreenStackHeaderTitleView = View
	const ScreenStackHeaderCenterView = View

	return {
		enableScreens,
		ScreenContainer,
		Screen,
		NativeScreen,
		NativeScreenContainer,
		ScreenStack,
		ScreenStackHeaderConfig,
		ScreenStackHeaderSubview,
		ScreenStackHeaderRightView,
		ScreenStackHeaderLeftView,
		ScreenStackHeaderTitleView,
		ScreenStackHeaderCenterView,
	}
})

jest.mock('@shakebugs/react-native-shake', () => {
	return {
		start: jest.fn(() => {}),
	}
})

jest.mock('@react-native-community/audio-toolkit', () => {
	class Player {
		prepare(cb: any) {
			if (cb) {
				cb()
			}
		}
		play(cb: any) {
			if (cb) {
				cb()
			}
		}
		seek(_: any, cb: any) {
			if (cb) {
				cb()
			}
		}
	}
	return {
		Player,
	}
})

jest.mock('react-native-fs', () => {
	return {
		mkdir: jest.fn(),
		moveFile: jest.fn(),
		copyFile: jest.fn(),
		pathForBundle: jest.fn(),
		pathForGroup: jest.fn(),
		getFSInfo: jest.fn(),
		getAllExternalFilesDirs: jest.fn(),
		unlink: jest.fn(),
		exists: jest.fn(),
		stopDownload: jest.fn(),
		resumeDownload: jest.fn(),
		isResumable: jest.fn(),
		stopUpload: jest.fn(),
		completeHandlerIOS: jest.fn(),
		readDir: jest.fn(),
		readDirAssets: jest.fn(),
		existsAssets: jest.fn(),
		readdir: jest.fn(),
		setReadable: jest.fn(),
		stat: jest.fn(),
		readFile: jest.fn(),
		read: jest.fn(),
		readFileAssets: jest.fn(),
		hash: jest.fn(),
		copyFileAssets: jest.fn(),
		copyFileAssetsIOS: jest.fn(),
		copyAssetsVideoIOS: jest.fn(),
		writeFile: jest.fn(),
		appendFile: jest.fn(),
		write: jest.fn(),
		downloadFile: jest.fn(),
		uploadFiles: jest.fn(),
		touch: jest.fn(),
		MainBundlePath: jest.fn(),
		CachesDirectoryPath: jest.fn(),
		DocumentDirectoryPath: jest.fn(),
		ExternalDirectoryPath: jest.fn(),
		ExternalStorageDirectoryPath: jest.fn(),
		TemporaryDirectoryPath: jest.fn(),
		LibraryDirectoryPath: jest.fn(),
		PicturesDirectoryPath: jest.fn(),
	}
})

jest.mock('rn-fetch-blob', () => {
	return {
		DocumentDir: jest.fn(),
		fetch: jest.fn(),
		base64: jest.fn(),
		android: jest.fn(),
		ios: jest.fn(),
		config: jest.fn(),
		session: jest.fn(),
		fs: {
			dirs: {
				MainBundleDir: jest.fn(),
				CacheDir: jest.fn(),
				DocumentDir: jest.fn(),
			},
		},
		wrap: jest.fn(),
		polyfill: jest.fn(),
		JSONStream: jest.fn(),
	}
})

jest.mock('react-native-share', () => ({
	default: jest.fn(),
}))

it('renders correctly', () => {
	renderer.create(<App />)
})
