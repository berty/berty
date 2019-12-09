import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import { languages } from './locale/languages'
import * as dateFns from './dateFns'

i18next.use(initReactI18next).init({
	fallbackLng: 'en',
	resources: languages,
	debug: true,
})

export default i18next
// export { languages } from './locale/languages'
