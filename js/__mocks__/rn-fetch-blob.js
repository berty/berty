export default {
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
