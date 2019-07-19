import i18n from 'i18next'
import dateFns from 'date-fns'

const loadedLocales = {
  en: require('date-fns/locale/en'),
  fr: require('date-fns/locale/fr'),
  ja: require('date-fns/locale/ja'),
  pl: require('date-fns/locale/pl'),
  ru: require('date-fns/locale/ru'),
  tr: require('date-fns/locale/tr'),
  // 'he': require('date-fns/locale/he'),
  // 'uk': require('date-fns/locale/uk'),
}

const getLocale = () => {
  let languageCode = 'en'
  try {
    languageCode = i18n.language.split('-')[0]
  } catch (e) {
    // noop
  }

  if (loadedLocales[languageCode] !== undefined) {
    return loadedLocales[languageCode]
  }

  return loadedLocales['en']
}

export const distanceInWords = (from, to) =>
  dateFns.distanceInWords(from, to, {
    locale: getLocale(),
  })

export const distanceInWordsToNow = from =>
  dateFns.distanceInWordsToNow(from, {
    includeSeconds: true,
    locale: getLocale(),
  })

export const formatTime = date =>
  dateFns.format(date, i18n.t('time.time'), { locale: getLocale() })

export const formatDateTime = date =>
  dateFns.format(date, i18n.t('time.datetime'), { locale: getLocale() })

export const fuzzyTimeOrFull = date => {
  if (dateFns.isToday(date)) {
    return distanceInWordsToNow(date)
  } else if (dateFns.isBefore(date, dateFns.subDays(Date.now(), 1))) {
    return formatTime(date)
  }

  return formatDateTime(date)
}

export const startedAgo = date =>
  i18n.t('time.started-ago', { date: distanceInWords(date, Date.now()) })
