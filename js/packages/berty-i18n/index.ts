import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import { languages } from './locale/languages'

i18next
	.use(initReactI18next)
	.init({
		fallbackLng: 'enUS',
		lng: 'enUS',
		resources: languages,
		debug: true,
		returnEmptyString: false,
	})
	.then()
	.catch((e: any) => {
		console.log('failed to init i18n:', e)
	})

export default i18next
