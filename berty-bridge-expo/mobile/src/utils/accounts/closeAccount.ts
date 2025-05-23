import { setStreamProgress, setStreamError } from '@berty/redux/reducers/ui.reducer'
import { AppDispatch, persistor, resetAccountStore } from '@berty/redux/store'

import { StreamProgressType } from '../protocol/progress.types'
import { accountClient } from './accountClient'

export const closeAccount = async (dispatch: AppDispatch) =>
	new Promise<void>(async (resolve, reject) => {
		try {
			console.log('flushing redux persistence')
			await persistor.flush()
			console.log('flushed redux persistence')
			persistor.pause()
			console.log('paused redux persistence')
			const stream = await accountClient.closeAccountWithProgress({})
			stream.onMessage((msg, err) => {
				if (err) {
					// TODO: check the real check on EOF
					if (err.EOF) {
						console.log('Node is closed')
						dispatch(resetAccountStore())
						resolve()
					} else {
						console.warn('Error while closing node:', err)
						reject(err)
					}
				}
				if (msg?.progress?.state !== 'done') {
					const progress = msg?.progress
					if (progress) {
						const payload: StreamProgressType = {
							msg: progress,
							stream: 'Close account',
						}
						dispatch(setStreamProgress(payload))
					}
				}
			})
			await stream.start()
		} catch (err) {
			console.warn('Failed to close node:', err)
			dispatch(resetAccountStore())
			dispatch(setStreamError({ error: new Error(`Failed to close node: ${err}`) }))
			reject(err)
		}
	})
