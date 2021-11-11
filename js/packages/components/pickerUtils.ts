import { Platform } from 'react-native'
import getPath from '@flyerhq/react-native-android-uri-path'
import DocumentPicker from 'react-native-document-picker'

import { MessengerState } from '@berty-tech/store'

export const importAccountFromDocumentPicker = async (ctx: MessengerState) => {
	try {
		const res = await DocumentPicker.pickSingle({
			type: Platform.OS === 'android' ? ['application/x-tar'] : ['public.tar-archive'],
		})
		const replaced =
			Platform.OS === 'android' ? getPath(res.uri) : res.uri.replace(/^file:\/\//, '')
		await ctx.importAccount(replaced)
	} catch (err: any) {
		if (DocumentPicker.isCancel(err)) {
			// ignore
		} else {
			console.error(err)
		}
	}
}
