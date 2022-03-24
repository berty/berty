import { Platform } from 'react-native'
import DocumentPicker from 'react-native-document-picker'

import { MessengerState } from '@berty-tech/store'
import { getPath } from '@berty-tech/rnutil/getPath'

export const importAccountFromDocumentPicker = async (ctx: MessengerState) => {
	try {
		const res = await DocumentPicker.pickSingle({
			type: Platform.OS === 'android' ? ['application/x-tar'] : ['public.tar-archive'],
		})
		const replaced = Platform.OS === 'android' ? await getPath(res.uri) : res.uri
		await ctx.importAccount(replaced.replace(/^file:\/\//, ''))
	} catch (err: any) {
		if (DocumentPicker.isCancel(err)) {
			// ignore
		} else {
			console.error(err)
		}
	}
}
