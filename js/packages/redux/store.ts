import { combineReducers, configureStore } from '@reduxjs/toolkit'
import newGroupReducer from './reducers/newGroup.reducer'

const rootReducer = combineReducers({
	newGroup: newGroupReducer,
})

const store = configureStore({
	reducer: rootReducer,
})

export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = typeof store.dispatch

export default store
