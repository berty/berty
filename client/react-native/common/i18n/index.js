import i18n from 'i18next'
import { reactI18nextModule } from 'react-i18next'
import ReactNativeLanguages from 'react-native-languages'

import en from './en/messages.json'
import fr from './fr/messages.json'

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
  .init(options)

export default i18n
