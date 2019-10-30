import * as dateFns from 'date-fns'
import i18n from './index'

import en from 'date-fns/locale/en-US'
import fr from 'date-fns/locale/fr'
import ja from 'date-fns/locale/ja'
import pl from 'date-fns/locale/pl'
import ru from 'date-fns/locale/ru'
import tr from 'date-fns/locale/tr'

const loadedLocales = {
	en,
	fr,
	ja,
	pl,
	ru,
	tr,
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

	return loadedLocales.en
}

export const distanceInWords = (from, to) =>
	dateFns.formatDistance(from, to, {
		locale: getLocale(),
	})

export const distanceInWordsToNow = (from) => distanceInWords(from, new Date(Date.now()))

export const format = (kind) => (date) => dateFns.format(date, kind, { locale: getLocale() })
export const formatWithFuzzyTime = format(i18n.t('time.fuzzy-time'))
export const formatWithFuzzyMonthDay = format(i18n.t('time.fuzzy-month-day'))
export const formatWithFuzzyYearMonth = format(i18n.t('time.fuzzy-year-month'))

export const formatTime = (date) =>
	dateFns.format(date, i18n.t('time.time'), { locale: getLocale() })

export const formatDateTime = (date) =>
	dateFns.format(date, i18n.t('time.datetime'), { locale: getLocale() })

export const fuzzyTimeOrFull = (date) => {
	if (dateFns.isToday(date)) {
		return distanceInWordsToNow(date)
	} else if (dateFns.isBefore(date, dateFns.subDays(Date.now(), 1))) {
		return formatTime(date)
	}

	return formatDateTime(date)
}

export const fuzzy = (date) => {
	if (dateFns.isToday(date)) {
		return formatWithFuzzyTime(date)
	}
	if (dateFns.isBefore(new Date(dateFns.getYear(date), dateFns.getMonth(date)), date)) {
		return formatWithFuzzyMonthDay(date)
	}
	if (dateFns.isBefore(new Date(dateFns.getYear(date)), date)) {
		return formatWithFuzzyYearMonth(date)
	}
}

export const startedAgo = (date) =>
	i18n.t('time.started-ago', { date: distanceInWords(date, Date.now()) })
