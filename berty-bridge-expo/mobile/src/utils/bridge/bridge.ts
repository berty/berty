import { Platform } from 'react-native'
import { GoBridge } from 'berty-bridge-expo'

import i18n from 'i18next'

// Android only: keep the process alive (and so the node) while the app is in the background
const startBackgroundService = async () => {
	if (Platform.OS !== 'android') {
		return
	}
	try {
		await GoBridge.startBackgroundService(
			i18n.t('notification.background-service.title'),
			i18n.t('notification.background-service.desc'),
		)
	} catch (err) {
		console.warn('unable to start the background service: ', err)
	}
}

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
			await startBackgroundService()
		}

		return true
	} catch (err: any) {
		if (err?.message?.indexOf('already instantiated') !== -1) {
			console.log('bridge already started: ', err)
			if (!external) {
				await startBackgroundService()
			}
			return true
		} else {
			console.error('unable to init bridge: ', err)
		}

		return false
	}
}
