import { ValidateSliceCaseReducers, SliceCaseReducers } from '@reduxjs/toolkit'
import { takeEvery } from 'redux-saga/effects'
import { Buffer } from 'buffer'

function defaultReducer<St>(state: St) {
	return state
}

export function makeDefaultReducers<St, Defs extends SliceCaseReducers<St>>(names: string[]) {
	return names.reduce((rdcs, name) => {
		rdcs[name] = defaultReducer
		return rdcs
	}, {} as any) as ValidateSliceCaseReducers<St, Defs>
}

export function makeDefaultCommandsSagas(commands: any, transactions: any) {
	return Object.keys(commands).map((commandName) =>
		takeEvery(commands[commandName], function* (action: any) {
			return yield* transactions[commandName](action.payload)
		}),
	)
}

export const BUFFER_ENCODING = 'base64'
export const strToBuf = (pk: string) => Buffer.from(pk, BUFFER_ENCODING)
export const bufToStr = (buf: Uint8Array) => Buffer.from(buf).toString(BUFFER_ENCODING)

export const JSON_ENCODING = 'utf-8'
export const jsonToBuf = (val: any) => Buffer.from(JSON.stringify(val), JSON_ENCODING)
export const bufToJSON = (buf: Uint8Array) => JSON.parse(Buffer.from(buf).toString(JSON_ENCODING))
