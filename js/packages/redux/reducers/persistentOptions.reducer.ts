import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// types

export enum PersistentOptionsKeys {
	Notifications = 'notifications',
	Suggestions = 'suggestions',
	Debug = 'debug',
	Log = 'log',
	Configurations = 'configurations',
	ProfileNotification = 'profileNotification',
	DevMode = 'devMode',
	ForceMock = 'forceMock',
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

type PersistentOptionsDevMode = {
	enable: boolean
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

export const UpdatesProfileNotification = 'updates'
type PersistentOptionsProfileNotification = {
	[UpdatesProfileNotification]: number
}

type PersistentOptionsForceMock = boolean

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
			type: typeof PersistentOptionsKeys.ProfileNotification
			payload: PersistentOptionsProfileNotification
	  }
	| {
			type: typeof PersistentOptionsKeys.DevMode
			payload: Partial<PersistentOptionsDevMode>
	  }
	| {
			type: typeof PersistentOptionsKeys.ForceMock
			payload: Partial<PersistentOptionsForceMock>
	  }

type PersistentOptions = {
	[PersistentOptionsKeys.Notifications]: PersistentOptionsNotifications
	[PersistentOptionsKeys.Suggestions]: PersistentOptionsSuggestions
	[PersistentOptionsKeys.Debug]: PersistentOptionsDebug
	[PersistentOptionsKeys.Log]: PersistentOptionsLog
	[PersistentOptionsKeys.Configurations]: PersistentOptionsConfigurations
	[PersistentOptionsKeys.ProfileNotification]: PersistentOptionsProfileNotification
	[PersistentOptionsKeys.DevMode]: PersistentOptionsDevMode
	[PersistentOptionsKeys.ForceMock]: PersistentOptionsForceMock
}

const defaultPersistentOptions = (): PersistentOptions => {
	let suggestions: PersistentOptionsSuggestions = {}
	// TODO uncomment it when suggestions bots works
	// Object.values(globals.berty.contacts).forEach(async value => {
	// 	if (value.suggestion) {
	// 		suggestions = {
	// 			...suggestions,
	// 			[value.name]: {
	// 				link: value.link,
	// 				displayName: value.name,
	// 				state: 'unread',
	// 				pk: '',
	// 				icon: value.icon,
	// 			},
	// 		}
	// 	}
	// })
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
		[PersistentOptionsKeys.ProfileNotification]: {
			[UpdatesProfileNotification]: 0,
		},
		[PersistentOptionsKeys.DevMode]: {
			enable: false,
		},
		[PersistentOptionsKeys.ForceMock]: false,
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

export const selectDevMode = (state: LocalRootState) => selectSlice(state).devMode
export const selectForceMock = (state: LocalRootState) => selectSlice(state).forceMock

export default makeRoot(slice.reducer)
