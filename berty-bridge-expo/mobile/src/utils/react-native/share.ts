import Clipboard from '@react-native-clipboard/clipboard'
import { TFunction } from 'react-i18next'
import { Platform, Share } from 'react-native'

export const shareBertyID = async (url: string | null | undefined, t: TFunction<'translation'>) => {
	if (!url) {
		console.warn('Share Berty ID, url is null or undefined')
		return
	}
	try {
		if (Platform.OS === 'web') {
			Clipboard.setString(url)
		} else {
			const message = `${t('share.sharing-id-message')}`
			const content = Platform.OS === 'ios' ? { url, message } : { message: `${message} ${url}` }
			await Share.share(content)
		}
	} catch (e) {
		console.warn(e)
	}
}
