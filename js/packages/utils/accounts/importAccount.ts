import beapi from '@berty/api'
import { setStreamProgress, setStreamError, setStreamDone } from '@berty/redux/reducers/ui.reducer'
import { AppDispatch } from '@berty/redux/store'

import { StreamProgressType } from '../protocol/progress.types'
import { accountClient } from './accountClient'

export const importAccount = async (path: string, dispatch: AppDispatch) =>
	new Promise<beapi.account.ImportAccountWithProgress.Reply | null>(async resolve => {
		let metaMsg: beapi.account.ImportAccountWithProgress.Reply | null = null
		try {
			const stream = await accountClient.importAccountWithProgress({ backupPath: path })
			stream.onMessage(async (msg, err) => {
				if (err?.EOF) {
					dispatch(setStreamDone())
					resolve(metaMsg)
				}
				if (err && !err.OK && !err?.EOF) {
					console.warn('import account error:', err.error.errorCode)
					dispatch(setStreamError({ error: new Error(`Failed to import account: ${err}`) }))
					resolve(null)
				}
				if (msg?.progress?.state !== 'done') {
					const progress = msg?.progress
					if (progress) {
						const payload: StreamProgressType = {
							msg: progress,
							stream: 'Import account',
						}
						dispatch(setStreamProgress(payload))
					}
				}

				metaMsg = msg?.accountMetadata ? msg : metaMsg
			})
			await stream.start()
		} catch (err) {
			dispatch(setStreamError({ error: new Error(`Failed to import account: ${err}`) }))
			resolve(null)
		}
	})
