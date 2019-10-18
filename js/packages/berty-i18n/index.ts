import i18next from 'i18next'
import { languages } from './locale/languages'

i18next.init(
  {
    fallbackLng: 'en',
    resources: languages,
    debug: true,
  },
  (err, t) => {
    if (err) {
      return console.log('something went wrong loading', err)
    }
  }
)

export default i18next
// export { languages } from './locale/languages'
