import Clipboard from '@react-native-clipboard/clipboard'
import { TFunction } from 'react-i18next'
import { Platform, Share } from 'react-native'

export const shareBertyID = async (url: string | null | undefined, t: TFunction<'translation'>) => {
	if (!url) {
		console.warn('Share Berty ID, url is null or undefined')
		return
	}
	const message = `${t('share.sharing-id-message')} ${url}`
	try {
		if (Platform.OS === 'web') {
			Clipboard.setString(url)
		} else {
			// i18n doesn't support this url value in argument
			await Share.share({ url: message, message })
		}
	} catch (e) {
		console.warn(e)
	}
}
