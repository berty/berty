import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer, PersistorOptions } from 'redux-persist'
import persistStorage from './persistStorage'

import newGroupReducer from './reducers/newGroup.reducer'
import chatInputsRootReducer from './reducers/chatInputs.reducer'

const persistConfig = {
	key: 'persistStore',
	storage: persistStorage,
	whitelist: [], // reducers to persist (strings)
}

const rootReducer = combineReducers({
	...newGroupReducer,
	...chatInputsRootReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

const store = configureStore({
	reducer: persistedReducer,
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
