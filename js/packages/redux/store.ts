import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer, PersistorOptions } from 'redux-persist'
import createMigrate from 'redux-persist/lib/createMigrate'

import { reduxPersistMigrations } from './migrations'
import persistStorage from './persistStorage'
import chatInputsRootReducer, {
	sliceName as chatInputsSliceName,
} from './reducers/chatInputs.reducer'
import chatInputsVolatileRootReducer from './reducers/chatInputsVolatile.reducer'
import newGroupRootReducer, {
	sliceName as newGroupSliceName,
} from './reducers/groupCreationForm.reducer'
import messengerRootReducer from './reducers/messenger.reducer'
import networkConfigReducer, {
	sliceName as networkConfigSliceName,
} from './reducers/networkConfig.reducer'
import persistentOptionsReducer, {
	sliceName as persistentOptionsSliceName,
} from './reducers/persistentOptions.reducer'
import themeReducer, { sliceName as themeSliceName } from './reducers/theme.reducer'
import uiReducer from './reducers/ui.reducer'

const persistConfig = {
	key: 'persistStore',
	storage: persistStorage,
	version: 0,
	whitelist: [
		newGroupSliceName,
		chatInputsSliceName,
		themeSliceName,
		networkConfigSliceName,
		persistentOptionsSliceName,
	],
	migrate: createMigrate(reduxPersistMigrations, { debug: true }),
}

const rootReducer = combineReducers({
	...newGroupRootReducer,
	...chatInputsRootReducer,
	...chatInputsVolatileRootReducer,
	...messengerRootReducer,
	...themeReducer,
	...uiReducer,
	...networkConfigReducer,
	...persistentOptionsReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const resetAccountStore = () => ({ type: 'RESET' })

const resettableReducer: typeof persistedReducer = (state, action, ...other) => {
	if (action.type === 'RESET') {
		return persistedReducer(undefined, action)
	}
	return persistedReducer(state, action, ...other)
}

const store = configureStore({
	reducer: resettableReducer,
	middleware: getDefaultMiddleware =>
		getDefaultMiddleware({
			serializableCheck: false,
		}),
})

export const persistor = persistStore(store, {
	manualPersist: true,
} as PersistorOptions)

export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = typeof store.dispatch

export default store
