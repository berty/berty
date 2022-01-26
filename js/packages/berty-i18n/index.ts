import { NativeModules, Platform } from 'react-native'
import i18next, { LanguageDetectorModule } from 'i18next'
import { initReactI18next } from 'react-i18next'

import { languages } from './locale/languages'

const fallbackLang = 'en-US'

export const osLanguage = (() => {
	const locale: string | undefined =
		Platform.OS === 'ios'
			? NativeModules?.SettingsManager?.settings?.AppleLanguages[0] // iOS 13
			: Platform.OS === 'android'
			? NativeModules?.I18nManager?.localeIdentifier
			: 'en-US'
	let lang = locale?.replace('_', '-')
	// the "en-" check is for weird locales like en-FR
	if (lang?.startsWith('en-') && !languages.hasOwnProperty(lang)) {
		lang = 'en-US'
	}
	if (!lang || !languages.hasOwnProperty(lang)) {
		lang = fallbackLang
	}
	return lang
})()

const RNLanguageDetector: LanguageDetectorModule = {
	type: 'languageDetector',
	init: () => {},
	detect: () => osLanguage,
	cacheUserLanguage: () => {},
}

i18next
	.use(RNLanguageDetector)
	.use(initReactI18next)
	.init({
		fallbackLng: fallbackLang,
		resources: languages,
		returnEmptyString: false,
	})
	.then()
	.catch((e: any) => {
		console.log('failed to init i18n:', e)
	})

export default i18next
