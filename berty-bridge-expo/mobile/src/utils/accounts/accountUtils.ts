import { Buffer } from 'buffer'
import { Alert } from 'react-native'
import RNFS from 'react-native-fs'
import Share from 'react-native-share'

import beapi from '@berty/api'
import { setAccounts } from '@berty/redux/reducers/ui.reducer'
import store from '@berty/redux/store'
import { serviceTypes } from '@berty/utils/remote-services/remote-services'

import { accountClient } from './accountClient'

/**
 * updates the AccountService account
 */
export const updateAccount = async (payload: any) => {
	try {
		let obj: beapi.account.UpdateAccount.IRequest = {
			accountId: payload.accountId,
		}
		if (payload.accountName) {
			obj.accountName = payload.accountName
		}
		if (payload.publicKey) {
			obj.publicKey = payload.publicKey
		}
		if (payload.avatarCid) {
			obj.avatarCid = payload.avatarCid
		}
		await accountClient.updateAccount(obj)
	} catch (e) {
		console.warn('unable to update account', e)
		return
	}

	await refreshAccountList()
}

export const refreshAccountList = async (): Promise<beapi.account.IAccountMetadata[]> => {
	try {
		const resp = await accountClient.listAccounts({})
		if (!resp.accounts) {
			return []
		}
		store.dispatch(setAccounts(resp.accounts))
		return resp.accounts
	} catch (e) {
		console.warn(e)
		return []
	}
}

// onSharing is called when the file is ready and the share sheet is about to be opened
export const exportLogfile = async (accountId: string | null, onSharing?: () => void) => {
	const title = 'Export logs'

	if (!accountId) {
		Alert.alert(title, 'No account selected.')
		return
	}

	const outFile = `${RNFS.TemporaryDirectoryPath}/berty-log-${accountId}.log`

	// Lines arrive from the stream callbacks, which are not awaited by stream.start().
	// They are batched and appended one batch at a time, in order, and we wait for the
	// last write before sharing the file (otherwise the file could be empty or truncated).
	let pending: string[] = []
	let pendingSize = 0
	let writeChain: Promise<void> = Promise.resolve()
	let writeError: unknown = null
	let streamError: unknown = null
	let lineCount = 0

	const flush = () => {
		if (pending.length === 0) {
			return
		}
		const chunk = pending.join('\n') + '\n'
		pending = []
		pendingSize = 0
		writeChain = writeChain
			.then(() => RNFS.appendFile(outFile, chunk, 'utf8'))
			.catch(err => {
				writeError = err
			})
	}

	try {
		// start from an empty file (also removes the file of a previous export)
		await RNFS.writeFile(outFile, '', 'utf8')

		const stream = await accountClient.streamLogfile({ accountId })
		stream.onMessage((msg, err) => {
			if (err && !err.EOF && !err.OK) {
				streamError = err
				return
			}
			if (msg && !msg.fileName && msg.line !== undefined && msg.line !== null) {
				const line =
					typeof msg.line === 'string' ? msg.line : Buffer.from(msg.line).toString('utf8')
				pending.push(line)
				pendingSize += line.length + 1
				lineCount++
				if (pendingSize >= 256 * 1024) {
					flush()
				}
			}
		})

		// resolves when the stream is closed (EOF) or failed
		await stream.start()
		flush()
		await writeChain

		if (streamError) {
			throw streamError
		}
		if (writeError) {
			throw writeError
		}
		if (lineCount === 0) {
			Alert.alert(
				title,
				'The log file is empty. File logging may be disabled (check "Log filters" in the developer tools) or no log was written yet.',
			)
			return
		}

		// The share sheet works on every Android version and on iOS. Writing straight into
		// the Download directory is not possible anymore with scoped storage (Android 11+),
		// the copy failed silently.
		onSharing?.()
		await Share.open({
			title: 'Berty log',
			url: `file://${outFile}`,
			type: 'text/plain',
			filename: `berty-log-${accountId}`,
			failOnCancel: false,
		})
	} catch (err) {
		console.warn('exportLogfile failed', err)
		const message = (err as any)?.message || String(err)
		Alert.alert(`${title} failed`, String(message))
	}
}

export const hasKnownPushServer = (
	account: beapi.messenger.IAccount | null | undefined,
): boolean => {
	const hasKnownPushServer = account?.serviceTokens?.some(t => {
		return t.supportedServices?.some(s => {
			return s.type === serviceTypes.Push
		})
	})
	return hasKnownPushServer || false
}
