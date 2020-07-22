import { takeEvery, call, take } from 'redux-saga/effects'
import { Buffer } from 'buffer'
import { createSlice } from '@reduxjs/toolkit'

function defaultReducer(state) {
	return state
}

export function makeDefaultReducers(names) {
	return names.reduce((rdcs, name) => {
		rdcs[name] = defaultReducer
		return rdcs
	}, {})
}

export function makeDefaultCommandsSagas(commands, transactions) {
	return Object.keys(commands).map((commandName) =>
		takeEvery(commands[commandName], function* (action) {
			return yield* transactions[commandName](action.payload)
		}),
	)
}

export function createCommands(name, iniState, commands) {
	return createSlice({
		name,
		initialState: iniState,
		reducers: commands.reduce((r, cmd) => ({ ...r, [cmd]: (state) => state }), {}),
	})
}

export function* unaryChan(func, ...args) {
	const chan = yield call(func, ...args)
	const reply = yield take(chan)
	chan.close()
	return reply
}

export const BUFFER_ENCODING = 'base64'
export const strToBuf = (pk) => Buffer.from(pk, BUFFER_ENCODING)
export const bufToStr = (buf: Uint8Array) => Buffer.from(buf).toString(BUFFER_ENCODING)

export const JSON_ENCODING = 'utf-8'
export const jsonToBuf = (val: any) => Buffer.from(JSON.stringify(val), JSON_ENCODING)
export const bufToJSON = (buf: Uint8Array) => JSON.parse(Buffer.from(buf).toString(JSON_ENCODING))
