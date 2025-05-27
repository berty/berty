import { genFakeMessengerData } from '../fakeGeneration'

/**
 * This uses a function and a cache to avoid having to wait on generation during initial js loading
 */

let goldenData: ReturnType<typeof genFakeMessengerData>

export const getGoldenData = () => {
	if (goldenData === undefined) {
		goldenData = genFakeMessengerData({
			seed: 42,
			baseDate: 1653308169918,
			accountDisplayName: 'Alice',
		})
	}
	return goldenData
}
