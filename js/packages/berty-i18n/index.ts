import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import { languages } from './locale/languages'

i18next.use(initReactI18next).init({
	fallbackLng: 'en',
	lng: 'en',
	resources: languages,
	debug: true,
})

export default i18next
