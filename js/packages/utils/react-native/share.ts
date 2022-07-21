import Clipboard from '@react-native-clipboard/clipboard'
import { t } from 'i18next'
import { Platform, Share } from 'react-native'

export const shareBertyID = async (url: string | null | undefined) => {
	if (!url) {
		console.warn('Share Berty ID, url is null or undefined')
		return
	}
	try {
		if (Platform.OS === 'web') {
			Clipboard.setString(url)
		} else {
			await Share.share({ url, message: t('share.sharing-id-message', { url }) })
		}
	} catch (e) {
		console.warn(e)
	}
}
