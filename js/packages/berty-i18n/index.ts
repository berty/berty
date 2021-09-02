import { NativeModules, Platform } from 'react-native'
import i18next, { LanguageDetectorModule } from 'i18next'
import { initReactI18next } from 'react-i18next'

import { languages } from './locale/languages'

const RNLanguageDetector: LanguageDetectorModule = {
	type: 'languageDetector',
	init: () => {},
	detect: () => {
		const locale =
			Platform.OS === 'ios'
				? NativeModules?.SettingsManager?.settings?.AppleLanguages[0] // iOS 13
				: NativeModules?.I18nManager?.localeIdentifier
		return locale?.replace('_', '-')
	},
	cacheUserLanguage: () => {},
}

i18next
	.use(initReactI18next)
	.use(RNLanguageDetector)
	.init({
		fallbackLng: 'en-US',
		resources: languages,
		returnEmptyString: false,
	})
	.then()
	.catch((e: any) => {
		console.log('failed to init i18n:', e)
	})

export default i18next
