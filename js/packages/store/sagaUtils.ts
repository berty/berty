import { EventChannel } from 'redux-saga'
import { call, take } from 'redux-saga/effects'

export type EventChannelOutput<C> = C extends EventChannel<infer T> ? T : never

export function* typedCall<F extends (...args: any) => any>(func: F, ...args: Parameters<F>) {
	const ret = (yield call(func, ...args)) as ReturnType<F>
	return ret
}

export function* unaryChan<F extends (...args: any) => any>(func: F, ...args: Parameters<F>) {
	const chan = yield* typedCall(func, ...args)
	const reply = (yield take(chan)) as EventChannelOutput<typeof chan>
	return reply
}
