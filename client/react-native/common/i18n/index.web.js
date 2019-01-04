import i18n from 'i18next'
import { reactI18nextModule } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { languages } from './languages'
import { I18nManager } from 'react-native'

I18nManager.allowRTL(true)

const isRTL = () => i18n.dir(i18n.language) === 'rtl'

const options = {
  fallbackLng: 'en',
  resources: languages,
  interpolation: { escapeValue: false }, // not needed for react
  react: {
    wait: true,
    nsMode: 'default',
  },
}

i18n
  .use(LanguageDetector)
  .use(reactI18nextModule) // passes i18n down to react-i18next
  .init(options, () => {
    I18nManager.forceRTL(isRTL())
  })

i18n.on('languageChanged', language => {
  if (!languages.hasOwnProperty(language)) {
    return
  }

  console.log(i18n.language)
  console.log(i18n.dir(i18n.language))
  I18nManager.forceRTL(isRTL())
})

export default i18n
export { languages, isRTL }
