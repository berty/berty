import { Platform } from 'react-native'
import DocumentPicker from 'react-native-document-picker'

import { getPath } from '@berty/rnutil/getPath'
import { importAccount } from '@berty/store/accountUtils'

export const importAccountFromDocumentPicker = async (embedded: boolean) => {
	try {
		const res = await DocumentPicker.pickSingle({
			type: Platform.OS === 'android' ? ['application/x-tar'] : ['public.tar-archive'],
		})
		const replaced = Platform.OS === 'android' ? await getPath(res.uri) : res.uri
		await importAccount(embedded, replaced.replace(/^file:\/\//, ''))
	} catch (err: any) {
		if (DocumentPicker.isCancel(err)) {
			// ignore
		} else {
			console.error(err)
		}
	}
}
