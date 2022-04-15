import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Platform } from 'react-native'

import { globals } from '@berty/config'

// types

export enum PersistentOptionsKeys {
	Notifications = 'notifications',
	Suggestions = 'suggestions',
	Debug = 'debug',
	Log = 'log',
	Configurations = 'configurations',
	LogFilters = 'logFilters',
	TyberHost = 'tyberHost',
	OnBoardingFinished = 'onBoardingFinished',
	ProfileNotification = 'profileNotification',
}

type PersistentOptionsNotifications = {
	enable: boolean
}

export type Suggestion = {
	link: string
	displayName: string
	// added | skipped | unread
	state: string
	pk: string
	icon: string
}

type PersistentOptionsSuggestions = {
	[key: string]: Suggestion
}

type PersistentOptionsDebug = {
	enable: boolean
}

type PersistentOptionsLog = {
	format: string
}

export type Configuration = {
	key: 'network' | 'notification' | 'replicate'
	displayName: string
	desc: string
	icon: string
	state: 'added' | 'skipped' | 'unread'
	color: string
}

type PersistentOptionsConfigurations = { [key: string]: Configuration }

type PersistentOptionsLogFilters = {
	format: string
}

type PersistentOptionsTyberHost = {
	address: string
}

type PersistentOptionsOnBoardingFinished = {
	isFinished: boolean
}

export const UpdatesProfileNotification = 'updates'
type PersistentOptionsProfileNotification = {
	[UpdatesProfileNotification]: number
}

type PersistentOptionsUpdate =
	| {
			type: typeof PersistentOptionsKeys.Notifications
			payload: Partial<PersistentOptionsNotifications>
	  }
	| {
			type: typeof PersistentOptionsKeys.Suggestions
			payload: Partial<PersistentOptionsSuggestions>
	  }
	| {
			type: typeof PersistentOptionsKeys.Debug
			payload: Partial<PersistentOptionsDebug>
	  }
	| {
			type: typeof PersistentOptionsKeys.Log
			payload: Partial<PersistentOptionsLog>
	  }
	| {
			type: typeof PersistentOptionsKeys.Configurations
			payload: Partial<PersistentOptionsConfigurations>
	  }
	| {
			type: typeof PersistentOptionsKeys.LogFilters
			payload: PersistentOptionsLogFilters
	  }
	| {
			type: typeof PersistentOptionsKeys.TyberHost
			payload: PersistentOptionsTyberHost
	  }
	| {
			type: typeof PersistentOptionsKeys.OnBoardingFinished
			payload: PersistentOptionsOnBoardingFinished
	  }
	| {
			type: typeof PersistentOptionsKeys.ProfileNotification
			payload: PersistentOptionsProfileNotification
	  }

export type PersistentOptions = {
	[PersistentOptionsKeys.Notifications]: PersistentOptionsNotifications
	[PersistentOptionsKeys.Suggestions]: PersistentOptionsSuggestions
	[PersistentOptionsKeys.Debug]: PersistentOptionsDebug
	[PersistentOptionsKeys.Log]: PersistentOptionsLog
	[PersistentOptionsKeys.Configurations]: PersistentOptionsConfigurations
	[PersistentOptionsKeys.LogFilters]: PersistentOptionsLogFilters
	[PersistentOptionsKeys.TyberHost]: PersistentOptionsTyberHost
	[PersistentOptionsKeys.OnBoardingFinished]: PersistentOptionsOnBoardingFinished
	[PersistentOptionsKeys.ProfileNotification]: PersistentOptionsProfileNotification
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
		[PersistentOptionsKeys.OnBoardingFinished]: {
			isFinished: false,
		},
		[PersistentOptionsKeys.ProfileNotification]: {
			[UpdatesProfileNotification]: 0,
		},
	}
}

export const sliceName = 'persistentOptions'

const makeRoot = <T>(val: T) => ({
	[sliceName]: val,
})

const initialState: PersistentOptions = defaultPersistentOptions()
const rootInitialState = makeRoot(initialState)
type LocalRootState = typeof rootInitialState

const slice = createSlice({
	name: sliceName,
	initialState,
	reducers: {
		setPersistentOption(
			state: PersistentOptions,
			{ payload }: PayloadAction<PersistentOptionsUpdate>,
		) {
			return {
				...state,
				[payload.type]: payload.payload,
			}
		},
	},
})

const selectSlice = (state: LocalRootState) => state[sliceName]

export const selectPersistentOptions = (state: LocalRootState) => selectSlice(state)

export const { setPersistentOption } = slice.actions

export default makeRoot(slice.reducer)
