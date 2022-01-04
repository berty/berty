import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer, PersistorOptions } from 'redux-persist'
import persistStorage from './persistStorage'

import newGroupRootReducer, {
	sliceName as newGroupSliceName,
} from './reducers/groupCreationForm.reducer'
import chatInputsRootReducer, {
	sliceName as chatInputsSliceName,
} from './reducers/chatInputs.reducer'
import chatInputsVolatileRootReducer from './reducers/chatInputsVolatile.reducer'
import checklistRootReducer, { sliceName as checklistSliceName } from './reducers/checklist.reducer'
import accountSettingsRootReducer, {
	sliceName as accountSettingsSliceName,
} from './reducers/accountSettings.reducer'
import themeReducer, { sliceName as themeSliceName } from './reducers/theme.reducer'
import messengerRootReduceer from './reducers/messenger.reducer'

const persistConfig = {
	key: 'persistStore',
	storage: persistStorage,
	whitelist: [
		newGroupSliceName,
		chatInputsSliceName,
		checklistSliceName,
		accountSettingsSliceName,
		themeSliceName,
	],
}

const rootReducer = combineReducers({
	...newGroupRootReducer,
	...chatInputsRootReducer,
	...chatInputsVolatileRootReducer,
	...checklistRootReducer,
	...accountSettingsRootReducer,
	...messengerRootReduceer,
	...themeReducer,
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
