import { GoBridge } from '@berty/native-modules/GoBridge'

export const initBridge = async (
	external: boolean,
	address: string,
	port: string,
): Promise<boolean> => {
	try {
		console.log('bridge methods: ', Object.keys(GoBridge))

		if (external) {
			const fullAddress = address + ':' + port
			await GoBridge.initBridgeRemote(fullAddress)
		} else {
			await GoBridge.initBridge()
		}

		return true
	} catch (err: any) {
		if (err?.message?.indexOf('already instantiated') !== -1) {
			console.log('bridge already started: ', err)
			return true
		} else {
			console.error('unable to init bridge: ', err)
		}

		return false
	}
}
