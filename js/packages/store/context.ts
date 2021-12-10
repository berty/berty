import { createContext, useContext } from 'react'
import { Platform } from 'react-native'
import i18next from '@berty-tech/berty-i18n'

import { globals } from '@berty-tech/config'
import { randomizeThemeColor } from '@berty-tech/styles'
import defaultTheme from '@berty-tech/styles/colors.json'
import pinkTheme from '@berty-tech/styles/pinktheme-default.json'
import darkTheme from '@berty-tech/styles/darktheme-default.json'

import {
	CheckListProfileNotification,
	MessengerAppState,
	MessengerState as MessengerState,
	PersistentOptions,
	PersistentOptionsKeys,
	PersistentOptionsSuggestions,
	UpdatesProfileNotification,
} from './types'

export const isDeletingState = (state: MessengerAppState): boolean =>
	state === MessengerAppState.DeletingClearingStorage ||
	state === MessengerAppState.DeletingClosingDaemon

export const isClosing = (state: MessengerAppState): boolean =>
	isDeletingState(state) || state === MessengerAppState.ClosingDaemon

export const isReadyingBasics = (state: MessengerAppState): boolean =>
	state === MessengerAppState.OpeningWaitingForDaemon ||
	state === MessengerAppState.OpeningWaitingForClients ||
	state === MessengerAppState.OpeningListingEvents ||
	state === MessengerAppState.OpeningGettingLocalSettings ||
	state === MessengerAppState.Closed ||
	state === MessengerAppState.OpeningMarkConversationsAsClosed ||
	state === MessengerAppState.StreamDone ||
	state === MessengerAppState.Init

const expectedAppStateChanges: any = {
	[MessengerAppState.Init]: [
		MessengerAppState.OpeningWaitingForClients,
		MessengerAppState.OpeningWaitingForDaemon,
		MessengerAppState.GetStarted,
	],
	[MessengerAppState.Closed]: [
		MessengerAppState.OpeningWaitingForClients,
		MessengerAppState.OpeningWaitingForDaemon,
		MessengerAppState.ClosingDaemon,
	],
	[MessengerAppState.OpeningWaitingForDaemon]: [
		MessengerAppState.StreamDone,
		MessengerAppState.OpeningWaitingForClients,
	],
	[MessengerAppState.OpeningWaitingForClients]: [
		MessengerAppState.OpeningWaitingForDaemon,
		MessengerAppState.OpeningListingEvents,
		MessengerAppState.OpeningMarkConversationsAsClosed,
	],
	[MessengerAppState.OpeningListingEvents]: [
		MessengerAppState.OpeningWaitingForDaemon,
		MessengerAppState.OpeningGettingLocalSettings,
	],
	[MessengerAppState.OpeningGettingLocalSettings]: [
		MessengerAppState.OpeningMarkConversationsAsClosed,
	],
	[MessengerAppState.OpeningMarkConversationsAsClosed]: [
		MessengerAppState.PreReady,
		MessengerAppState.Ready,
	],
	[MessengerAppState.GetStarted]: [MessengerAppState.OpeningWaitingForDaemon],
	[MessengerAppState.Ready]: [
		MessengerAppState.OpeningWaitingForDaemon,
		MessengerAppState.DeletingClosingDaemon,
		MessengerAppState.ClosingDaemon,
		MessengerAppState.OpeningWaitingForClients,
		MessengerAppState.StreamDone,
	],
	[MessengerAppState.ClosingDaemon]: [
		MessengerAppState.Closed,
		MessengerAppState.OpeningWaitingForDaemon,
		MessengerAppState.OpeningWaitingForClients,
	],
	[MessengerAppState.DeletingClosingDaemon]: [MessengerAppState.DeletingClearingStorage],
	[MessengerAppState.DeletingClearingStorage]: [
		MessengerAppState.Closed,
		MessengerAppState.OpeningWaitingForDaemon,
	],
	[MessengerAppState.PreReady]: [MessengerAppState.Ready],
	[MessengerAppState.StreamDone]: [
		MessengerAppState.GetStarted,
		MessengerAppState.OpeningWaitingForClients,
	],
}

export const isExpectedAppStateChange = (
	former: MessengerAppState,
	next: MessengerAppState,
): boolean => {
	if (former === next) {
		return true
	}

	return (expectedAppStateChanges[former] || []).indexOf(next) !== -1
}

export const DefaultBertyTheme = 'default-berty-theme'
export const CurrentGeneratedTheme = 'current-generated'
export const DefaultPinkTheme = 'pink-theme'
export const DefaultDarkTheme = 'dark-theme'

export const defaultThemeColor = () => {
	return {
		selected: DefaultBertyTheme,
		collection: {
			[DefaultBertyTheme]: { colors: defaultTheme },
			[CurrentGeneratedTheme]: { colors: randomizeThemeColor() },
			[DefaultPinkTheme]: { colors: pinkTheme },
			[DefaultDarkTheme]: { colors: darkTheme },
		},
		isDark: false,
	}
}

export const defaultPersistentOptions = (): PersistentOptions => {
	let suggestions: PersistentOptionsSuggestions = {}
	Object.values(globals.berty.contacts).forEach(async value => {
		if (value.suggestion) {
			suggestions = {
				...suggestions,
				[value.name]: {
					link: value.link,
					displayName: value.name,
					state: 'unread',
					pk: '',
					icon: value.icon,
				},
			}
		}
	})
	return {
		[PersistentOptionsKeys.I18N]: {
			language: i18next.language || 'en-US',
		},
		[PersistentOptionsKeys.Notifications]: {
			enable: true,
		},
		[PersistentOptionsKeys.Suggestions]: suggestions,
		[PersistentOptionsKeys.Debug]: {
			enable: false,
		},
		[PersistentOptionsKeys.Log]: {
			format: 'json',
		},
		[PersistentOptionsKeys.Configurations]: {},
		[PersistentOptionsKeys.LogFilters]: {
			format: '*:bty*',
		},
		[PersistentOptionsKeys.TyberHost]: {
			address: Platform.OS === 'android' ? '10.0.2.2:4242' : '127.0.0.1:4242',
		},
		[PersistentOptionsKeys.ThemeColor]: defaultThemeColor(),
		[PersistentOptionsKeys.OnBoardingFinished]: {
			isFinished: false,
		},
		[PersistentOptionsKeys.CheckList]: {
			isCollapsed: false,
			items: {
				avatar: {
					title: 'settings.home.check-list.avatar.title',
					desc: 'settings.home.check-list.avatar.desc',
				},
				relay: {
					title: 'settings.home.check-list.relay.title',
					desc: 'settings.home.check-list.relay.desc',
				},
				contact: {
					title: 'settings.home.check-list.contact.title',
					desc: 'settings.home.check-list.contact.desc',
				},
				group: {
					title: 'settings.home.check-list.group.title',
					desc: 'settings.home.check-list.group.desc',
				},
				message: {
					title: 'settings.home.check-list.message.title',
					desc: 'settings.home.check-list.message.desc',
				},
				'hidden-account': {
					title: 'settings.home.check-list.hidden-account.title',
					desc: 'settings.home.check-list.hidden-account.desc',
				},
				theme: {
					title: 'settings.home.check-list.theme.title',
					desc: 'settings.home.check-list.theme.desc',
				},
				'ble-message': {
					title: 'settings.home.check-list.ble-message.title',
					desc: 'settings.home.check-list.ble-message.desc',
				},
			},
		},
		[PersistentOptionsKeys.ProfileNotification]: {
			[CheckListProfileNotification]: 1,
			[UpdatesProfileNotification]: 0,
		},
	}
}

export const initialState = {
	appState: MessengerAppState.Init,
	selectedAccount: null,
	nextSelectedAccount: null,
	conversations: {},
	contacts: {},
	interactions: {},
	members: {},
	medias: {},
	client: null,
	protocolClient: null,
	streamError: null,
	streamInProgress: null,

	addNotificationListener: () => {},
	removeNotificationListener: () => {},
	notificationsInhibitors: [],

	persistentOptions: defaultPersistentOptions(),
	daemonAddress: '',
	initialListComplete: false,
	clearClients: null,

	embedded: true,
	dispatch: () => {},

	setPersistentOption: async () => {},
	createNewAccount: async () => {},
	importAccount: async () => {},
	switchAccount: async () => {},
	updateAccount: async () => {},
	deleteAccount: async () => {},
	getUsername: async () => {
		return null
	},
	restart: async () => {},
	setDebugMode: () => {},
	playSound: () => {},
	debugMode: true,
	accounts: [],
	addReaction: () => undefined,
	removeReaction: () => undefined,

	networkConfig: {},
	setNetworkConfig: () => {},
	handledLink: false,
	setHandledLink: () => {},
}

export const MessengerContext = createContext<MessengerState>(initialState)

export default MessengerContext

export const useMessengerContext = (): MessengerState => useContext(MessengerContext)

export const isCheckListItemDone = (ctx: MessengerState, key: string): boolean =>
	!!ctx.persistentOptions[PersistentOptionsKeys.CheckList].items[key].done

export const setCheckListItemDone = async (ctx: MessengerState, key: string): Promise<void> => {
	if (isCheckListItemDone(ctx, key)) {
		return
	}
	return ctx.setPersistentOption({
		type: PersistentOptionsKeys.CheckList,
		payload: {
			...ctx.persistentOptions[PersistentOptionsKeys.CheckList],
			items: {
				...ctx.persistentOptions[PersistentOptionsKeys.CheckList].items,
				[key]: {
					...ctx.persistentOptions[PersistentOptionsKeys.CheckList].items[key],
					done: true,
				},
			},
		},
	})
}
