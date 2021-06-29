import React, { useCallback, useEffect, useState } from 'react'
import {
	View,
	Text,
	Platform,
	TouchableOpacity,
	ScrollView,
	Alert,
	StyleSheet,
	StatusBar,
} from 'react-native'
import RNFS from 'react-native-fs'
import { useTranslation } from 'react-i18next'
import { SafeAreaView } from 'react-native-safe-area-context'

import beapi from '@berty-tech/api'
import { berty } from '@berty-tech/api/root.pb'
import { GRPCError, Service } from '@berty-tech/grpc-bridge'
import { bridge as rpcBridge } from '@berty-tech/grpc-bridge/rpc'
import { useMsgrContext } from '@berty-tech/store/context'

export const accountService = Service(beapi.account.AccountService, rpcBridge, null)

const styles = StyleSheet.create({
	safeViewContainer: {
		backgroundColor: '#000000',
		height: '100%',
	},
	page: {
		margin: 12,
		marginBottom: 60,
		flexDirection: 'column',
	},
	footerButton: {
		borderColor: '#c0c0c0',
		borderRadius: 6,
		borderStyle: 'solid',
		borderWidth: 1,
		margin: 2,
		padding: 8,
		flex: 1,
	},
	button: {
		borderColor: '#c0c0c0',
		borderRadius: 6,
		borderStyle: 'solid',
		borderBottomWidth: 1,
		margin: 2,
		padding: 5,
		flex: 1,
	},
	text: {
		color: '#00ff00',
		fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
	},
	header1: {
		fontWeight: 'bold',
		fontSize: 38,
	},
	header2: {
		fontWeight: 'bold',
		fontSize: 22,
	},
	bold: { fontWeight: 'bold' },
	textError: { color: '#ff0000', fontWeight: 'bold' },
})

const getRootDir = () => {
	switch (Platform.OS) {
		case 'ios': // Check GoBridge.swift
		case 'android': // Check GoBridgeModule.java
			return RNFS.DocumentDirectoryPath + '/berty'

		default:
			throw new Error('unsupported platform')
	}
}

const confirmActionWrapper = (title: string, action: () => void, t: any) => () => {
	Alert.alert(title, '', [
		{
			text: t('debug.inspector.confirm-alert.button-confirm'),
			onPress: action,
			style: 'destructive',
		},
		{
			text: t('debug.inspector.confirm-alert.button-cancel'),
			onPress: () => {},
			style: 'cancel',
		},
	])
}

class FSItem {
	fileName: string = ''
	metadataFileFound: boolean = false
	messengerDBFound: boolean = false
	ipfsConfigFound: boolean = false
}

const fetchFSAccountList = (updateAccountFSFiles: (arg: Array<FSItem>) => void, t: any) => {
	const f = async () => {
		const files = await RNFS.readDir(getRootDir())
		const items: Array<FSItem> = []

		for (const file of files) {
			const fsi = new FSItem()

			try {
				await RNFS.stat(getRootDir() + '/' + file.name + '/account_meta')
				fsi.metadataFileFound = true
			} catch (e) {}

			try {
				await RNFS.stat(getRootDir() + '/' + file.name + '/account0/messenger.sqlite')
				fsi.messengerDBFound = true
			} catch (e) {}

			try {
				await RNFS.stat(getRootDir() + '/' + file.name + '/ipfs/config')
				fsi.ipfsConfigFound = true
			} catch (e) {}

			fsi.fileName = file.name

			items.push(fsi)
		}

		updateAccountFSFiles(items.sort((a, b) => a.fileName.localeCompare(b.fileName)))
	}

	f().catch((err: Error) => {
		console.warn(err)
		Alert.alert(t('debug.inspector.errors.listing-files-failed'), err.message)
	})
}

const fetchProtoAccountList = (
	updateAccountProtoEntries: (arg: { [key: string]: berty.account.v1.IAccountMetadata }) => void,
	t: any,
) => {
	const f = async () => {
		const resp = await accountService.listAccounts({})

		if (!resp) {
			updateAccountProtoEntries({})
			return
		}

		const allAccounts = (await resp).accounts.reduce<{
			[key: string]: berty.account.v1.IAccountMetadata
		}>((all, e) => ({ ...all, [e.accountId!]: e }), {})

		updateAccountProtoEntries(allAccounts)
	}

	f().catch((err: Error) => {
		console.warn(err)
		if (err instanceof GRPCError) {
			Alert.alert(t('debug.inspector.errors.listing-accounts-failed-grpc'), err.error.message)
		} else {
			Alert.alert(t('debug.inspector.errors.listing-accounts-failed'), err.message)
		}
	})
}

const accountAction = async (
	accountId: string,
	setLastUpdate: React.Dispatch<React.SetStateAction<number>>,
	t: any,
) => {
	let title = t('debug.inspector.accounts.action-delete.file-exists', { accountId: accountId })

	try {
		const stat = await RNFS.stat(getRootDir() + '/' + accountId)
		if (stat.isFile()) {
			title = t('debug.inspector.accounts.action-delete.file-exists', { accountId: accountId })
		} else {
			title = t('debug.inspector.accounts.action-delete.account-exists', { accountId: accountId })
		}
	} catch (err) {
		console.warn(err)
		Alert.alert(t('debug.inspector.accounts.action-delete.fs-read-error'), err.message)
		return
	}

	Alert.alert(title, t('debug.inspector.accounts.action-delete.actions-title'), [
		{
			text: t('debug.inspector.accounts.action-delete.action-account-manager'),
			onPress: confirmActionWrapper(
				t('debug.inspector.accounts.action-delete.action-account-manager-confirm'),
				() => {
					// close account if necessary
					accountService
						.closeAccount({})
						.catch((err: Error) => {
							console.warn(err)
							Alert.alert(t('debug.inspector.accounts.action-delete.error-close'), err.message)
						})
						// delete account
						.then(() => accountService.deleteAccount({ accountId: accountId }))
						.then(() => Alert.alert(t('debug.inspector.accounts.action-delete.success-feedback')))
						.catch((err: Error) => {
							console.warn(err)
							Alert.alert(t('debug.inspector.accounts.action-delete.error-delete'), err.message)
						})
						.finally(() => setLastUpdate(Date.now()))
				},
				t,
			),
			style: 'destructive',
		},
		{
			text: t('debug.inspector.accounts.action-delete.action-force-delete'),
			onPress: confirmActionWrapper(
				t('debug.inspector.accounts.action-delete.action-force-delete-confirm'),
				() => {
					RNFS.unlink(getRootDir() + '/' + accountId)
						.then(() => Alert.alert(t('debug.inspector.accounts.action-delete.success-feedback')))
						.catch((err: Error) => {
							console.warn(err)
							Alert.alert(t('debug.inspector.accounts.action-delete.error-delete'), err.message)
						})
						.finally(() => setLastUpdate(Date.now()))
				},
				t,
			),
			style: 'destructive',
		},
		{
			text: t('debug.inspector.accounts.action-delete.action-cancel'),
			onPress: () => {},
			style: 'cancel',
		},
	])
}

// const ExportAllAppData = () => {
// 	const { t }: { t: any } = useTranslation()
//
// 	return (
// 		<TouchableOpacity style={{ flex: 1 }}>
// 			<View style={[styles.button]}>
// 				<Text style={[styles.text, styles.bold]}>{t('debug.inspector.dump.button')}</Text>
// 			</View>
// 		</TouchableOpacity>
// 	)
// }

const AccountsInspector: React.FC<{
	lastRefresh: Number
	setLastUpdate: React.Dispatch<React.SetStateAction<number>>
}> = ({ lastRefresh, setLastUpdate }) => {
	const [accountFSFiles, updateAccountFSFiles] = useState<Array<FSItem>>([])
	const [accountProtoEntries, updateAccountProtoEntries] = useState<{
		[key: string]: berty.account.v1.IAccountMetadata
	}>({})
	const { t }: { t: any } = useTranslation()

	useEffect(() => fetchFSAccountList(updateAccountFSFiles, t), [
		updateAccountFSFiles,
		lastRefresh,
		t,
	])
	useEffect(() => fetchProtoAccountList(updateAccountProtoEntries, t), [
		updateAccountProtoEntries,
		lastRefresh,
		t,
	])

	return (
		<>
			{accountFSFiles.map((acc) => {
				const isMetaLoaded = accountProtoEntries.hasOwnProperty(acc.fileName)

				return (
					<TouchableOpacity
						key={acc.fileName}
						onPress={() => accountAction(acc.fileName, setLastUpdate, t)}
					>
						<View style={[{ paddingBottom: 2, paddingTop: 2 }, styles.button]}>
							<Text numberOfLines={1} style={[styles.bold, styles.text]}>
								{acc.fileName}
							</Text>
							<View>
								{isMetaLoaded ? (
									<>
										{accountProtoEntries[acc.fileName].name ? (
											<Text numberOfLines={1} style={[styles.text]}>
												{t('debug.inspector.accounts.infos.aligned.name', {
													name: accountProtoEntries[acc.fileName].name,
												})}
											</Text>
										) : null}
										{accountProtoEntries[acc.fileName].creationDate ? (
											<Text numberOfLines={1} style={[styles.text]}>
												{t('debug.inspector.accounts.infos.aligned.created', {
													created: new Date(
														parseInt(accountProtoEntries[acc.fileName].creationDate, 10) / 1000,
													).toUTCString(),
												})}
											</Text>
										) : null}

										{accountProtoEntries[acc.fileName].lastOpened ? (
											<Text numberOfLines={1} style={[styles.text]}>
												{t('debug.inspector.accounts.infos.aligned.opened', {
													opened: new Date(
														parseInt(accountProtoEntries[acc.fileName].lastOpened, 10) / 1000,
													).toUTCString(),
												})}
											</Text>
										) : null}
										{accountProtoEntries[acc.fileName].error ? (
											<Text style={[styles.text]}>
												{t('debug.inspector.accounts.infos.aligned.error', {
													error: accountProtoEntries[acc.fileName].error,
												})}
											</Text>
										) : null}
									</>
								) : (
									<>
										<Text numberOfLines={1} style={[styles.text, styles.textError]}>
											{t('debug.inspector.accounts.data-not-found')}
										</Text>
									</>
								)}
								<>
									{!isMetaLoaded && (
										<>
											{acc.metadataFileFound && (
												<Text style={[styles.text, styles.textError]} numberOfLines={1}>
													{t('debug.inspector.accounts.status.metadata-found')}
												</Text>
											)}
											{acc.ipfsConfigFound && (
												<Text style={[styles.text, styles.textError]} numberOfLines={1}>
													{t('debug.inspector.accounts.status.ipfs-repo-config-found')}
												</Text>
											)}
											{acc.messengerDBFound && (
												<Text style={[styles.text, styles.textError]} numberOfLines={1}>
													{t('debug.inspector.accounts.status.messenger-db-found')}
												</Text>
											)}
										</>
									)}
									{isMetaLoaded && !accountProtoEntries[acc.fileName].error && (
										<>
											{!acc.metadataFileFound && (
												<Text style={[styles.text, styles.textError]} numberOfLines={1}>
													{t('debug.inspector.accounts.status.metadata-not-found')}
												</Text>
											)}
											{!acc.ipfsConfigFound && (
												<Text style={[styles.text, styles.textError]} numberOfLines={1}>
													{t('debug.inspector.accounts.status.ipfs-repo-config-not-found')}
												</Text>
											)}
											{!acc.messengerDBFound && (
												<Text style={[styles.text, styles.textError]} numberOfLines={1}>
													{t('debug.inspector.accounts.status.messenger-db-not-found')}
												</Text>
											)}
										</>
									)}
								</>
							</View>
						</View>
					</TouchableOpacity>
				)
			})}
		</>
	)
}

const AppInspector: React.FC<{ embedded: boolean; error: Error | null }> = ({
	embedded,
	error,
}) => {
	const [lastUpdate, setLastUpdate] = useState(Date.now())
	const { t }: { t: any } = useTranslation()
	const { setDebugMode } = useMsgrContext()

	const refresh = useCallback(() => setLastUpdate(Date.now()), [setLastUpdate])

	return (
		<SafeAreaView style={[styles.safeViewContainer]}>
			<StatusBar backgroundColor='black' barStyle='light-content' />
			<View style={{ paddingHorizontal: 12, flexDirection: 'column' }}>
				<Text style={[styles.text, styles.header1]}>{t('debug.inspector.title')}</Text>

				<View style={{ paddingVertical: 12 }}>
					<Text style={[styles.text, styles.header2]}>{t('debug.inspector.errors.title')}</Text>
					{error ? (
						<View style={[styles.button]}>
							<Text style={[styles.text]}>❌ {t('debug.inspector.errors.header-reported')}</Text>
							<Text style={[styles.bold]}>{error.message}</Text>
							<Text>{error.stack}</Text>
						</View>
					) : (
						<Text style={[styles.text, styles.bold, styles.button]}>
							✅ {t('debug.inspector.errors.header-all-clear')}
						</Text>
					)}
				</View>
			</View>

			<ScrollView style={[styles.page]} contentContainerStyle={{ paddingBottom: 30 }}>
				<Text style={[styles.text, styles.header2]}>{t('debug.inspector.accounts.title')}</Text>
				{embedded ? (
					<AccountsInspector lastRefresh={lastUpdate} setLastUpdate={setLastUpdate} />
				) : (
					<Text style={[styles.text]}>
						❌ {t('debug.inspector.accounts.unsupported-remote-mode')}
					</Text>
				)}
			</ScrollView>
			<View style={{ position: 'absolute', bottom: 30, left: 0, right: 0 }}>
				<View style={{ flexDirection: 'row', paddingHorizontal: 12 }}>
					<TouchableOpacity onPress={refresh} style={{ flex: 1 }}>
						<View style={[styles.footerButton]}>
							<Text style={[styles.text, styles.bold, { textAlign: 'center' }]}>
								{t('debug.inspector.refresh')}
							</Text>
						</View>
					</TouchableOpacity>
					{/*<ExportAllAppData />*/}
					<TouchableOpacity onPress={() => setDebugMode(false)} style={{ flex: 1 }}>
						<View style={[styles.footerButton]}>
							<Text style={[styles.text, styles.bold, { textAlign: 'center' }]}>
								{t('debug.inspector.hide-button')}
							</Text>
						</View>
					</TouchableOpacity>
				</View>
			</View>
		</SafeAreaView>
	)
}

export default AppInspector
