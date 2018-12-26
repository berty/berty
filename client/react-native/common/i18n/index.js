import i18n from 'i18next'
import { reactI18nextModule } from 'react-i18next'
import ReactNativeLanguages from 'react-native-languages'
import { AsyncStorage } from 'react-native'

import en from './en/messages.json'
import fr from './fr/messages.json'

import { languages } from './languages'

const options = {
  fallbackLng: 'en',
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: ReactNativeLanguages.language,
  interpolation: { escapeValue: false }, // not needed for react
  react: {
    wait: true,
    nsMode: 'default',
  },
}

i18n
  .use(reactI18nextModule) // passes i18n down to react-i18next
  .init(options, () => {
    AsyncStorage.getItem('@BertyApp:i18n-language', (err, language) => {
      if (err) {
        return
      }

      if (!languages.hasOwnProperty(language)) {
        return
      }

      i18n.changeLanguage(language)
    })
  })

i18n.on('languageChanged', language => {
  if (!languages.hasOwnProperty(language)) {
    return
  }

  AsyncStorage.getItem('@BertyApp:i18n-language', (_, oldLanguage) => {
    if (oldLanguage === language) {
      return
    }

    AsyncStorage.setItem('@BertyApp:i18n-language', language)
  })
})

export default i18n
export { languages }
