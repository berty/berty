import AsyncStorage from '@react-native-async-storage/async-storage'

export enum AsyncStorageKeys {
	SelectNode = 'selectNode',
}

export type NodeInfos = {
	external: boolean
	address: string
	accountPort: string
	messengerPort: string
	dontAsk: boolean
}

export const NodeInfosDefault: NodeInfos = {
	external: false,
	address: '10.10.0.2',
	accountPort: '9092',
	messengerPort: '9091',
	dontAsk: false,
}

export const storeData = async (key: string, value: any): Promise<boolean> => {
	try {
		const jsonValue = JSON.stringify(value)
		await AsyncStorage.setItem(key, jsonValue)
		return true
	} catch (e) {
		console.log('error: cannot store value:', e)
		return false
	}
}

export const getData = async (key: string): Promise<any | null> => {
	try {
		const jsonValue = await AsyncStorage.getItem(key)
		return jsonValue != null ? JSON.parse(jsonValue) : null
	} catch (e) {
		console.log('error: cannot get value:', e)
		return null
	}
}
