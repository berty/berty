import React, { useCallback, useEffect, useState } from 'react'
import {
	View,
	Platform,
	TouchableOpacity,
	ScrollView,
	Alert,
	StyleSheet,
	StatusBar,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { SafeAreaView } from 'react-native-safe-area-context'
import RNFS from 'react-native-fs'
import { NativeModules } from 'react-native'

import beapi from '@berty/api'
import { GRPCError, Service } from '@berty/grpc-bridge'
import { bridge as rpcBridge } from '@berty/grpc-bridge/rpc'
import { pbDateToNum } from '@berty/store'
import { useStyles } from '@berty/contexts/styles'
import { useAppDispatch } from '@berty/hooks'
import { setDebugMode } from '@berty/redux/reducers/ui.reducer'

import { UnifiedText } from '../shared-components/UnifiedText'

const { RootDir } = NativeModules

const accountService = Service(beapi.account.AccountService, rpcBridge, null)

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
		fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
	},
	header1: { fontSize: 38 },
	header2: { fontSize: 22 },
	textError: {
		color: '#ff0000',
	},
})

const getRootDir = async () => {
	switch (Platform.OS) {
		case 'ios': // Check GoBridge.swift
		case 'android': // Check GoBridgeModule.java
			return RootDir.get()

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
	datastoreFound: boolean = false
	messengerDBFound: boolean = false
	ipfsRepoFound: boolean = false
}

const fetchFSAccountList = (updateAccountFSFiles: (arg: Array<FSItem>) => void, t: any) => {
	const f = async () => {
		const rootDir = (await getRootDir()) + '/accounts'
		const files = await RNFS.readDir(rootDir)
		const items: Array<FSItem> = []

		for (const file of files) {
			const fsi = new FSItem()

			try {
				await RNFS.stat(rootDir + '/' + file.name + '/datastore.sqlite')
				fsi.datastoreFound = true
			} catch (e) {}

			try {
				await RNFS.stat(rootDir + '/' + file.name + '/messenger.sqlite')
				fsi.messengerDBFound = true
			} catch (e) {}

			try {
				await RNFS.stat(rootDir + '/' + file.name + '/ipfs.sqlite')
				fsi.ipfsRepoFound = true
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
	updateAccountProtoEntries: (arg: { [key: string]: beapi.account.IAccountMetadata }) => void,
	t: any,
) => {
	const f = async () => {
		const resp = await accountService.listAccounts({})

		if (!resp) {
			updateAccountProtoEntries({})
			return
		}

		const allAccounts = (await resp).accounts.reduce<{
			[key: string]: beapi.account.IAccountMetadata
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
		const stat = await RNFS.stat((await getRootDir()) + '/' + accountId)
		if (stat.isFile()) {
			title = t('debug.inspector.accounts.action-delete.file-exists', { accountId: accountId })
		} else {
			title = t('debug.inspector.accounts.action-delete.account-exists', { accountId: accountId })
		}
	} catch (err: any) {
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
				async () => {
					RNFS.unlink((await getRootDir()) + '/' + accountId)
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
		[key: string]: beapi.account.IAccountMetadata
	}>({})
	const { t }: { t: any } = useTranslation()
	const { text } = useStyles()

	useEffect(
		() => fetchFSAccountList(updateAccountFSFiles, t),
		[updateAccountFSFiles, lastRefresh, t],
	)
	useEffect(
		() => fetchProtoAccountList(updateAccountProtoEntries, t),
		[updateAccountProtoEntries, lastRefresh, t],
	)

	return (
		<>
			{accountFSFiles.map(acc => {
				const isMetaLoaded = accountProtoEntries.hasOwnProperty(acc.fileName)

				return (
					<TouchableOpacity
						key={acc.fileName}
						onPress={() => accountAction(acc.fileName, setLastUpdate, t)}
					>
						<View style={[{ paddingBottom: 2, paddingTop: 2 }, styles.button]}>
							<UnifiedText numberOfLines={1} style={[text.bold, styles.text]}>
								{acc.fileName}
							</UnifiedText>
							<View>
								{isMetaLoaded ? (
									<>
										{accountProtoEntries[acc.fileName].name ? (
											<UnifiedText numberOfLines={1} style={[styles.text]}>
												{t('debug.inspector.accounts.infos.aligned.name', {
													name: accountProtoEntries[acc.fileName].name,
												})}
											</UnifiedText>
										) : null}
										{accountProtoEntries[acc.fileName].creationDate ? (
											<UnifiedText numberOfLines={1} style={[styles.text]}>
												{t('debug.inspector.accounts.infos.aligned.created', {
													created: new Date(
														pbDateToNum(accountProtoEntries[acc.fileName].creationDate) / 1000,
													).toUTCString(),
												})}
											</UnifiedText>
										) : null}

										{accountProtoEntries[acc.fileName].lastOpened ? (
											<UnifiedText numberOfLines={1} style={[styles.text]}>
												{t('debug.inspector.accounts.infos.aligned.opened', {
													opened: new Date(
														pbDateToNum(accountProtoEntries[acc.fileName].lastOpened) / 1000,
													).toUTCString(),
												})}
											</UnifiedText>
										) : null}
										{accountProtoEntries[acc.fileName].error ? (
											<UnifiedText style={[styles.text]}>
												{t('debug.inspector.accounts.infos.aligned.error', {
													error: accountProtoEntries[acc.fileName].error,
												})}
											</UnifiedText>
										) : null}
									</>
								) : (
									<>
										<UnifiedText
											numberOfLines={1}
											style={[styles.text, text.bold, styles.textError]}
										>
											{t('debug.inspector.accounts.data-not-found')}
										</UnifiedText>
									</>
								)}
								<>
									{!isMetaLoaded && (
										<>
											{acc.datastoreFound && (
												<UnifiedText
													style={[styles.text, text.bold, styles.textError]}
													numberOfLines={1}
												>
													{t('debug.inspector.accounts.status.datastore-found')}
												</UnifiedText>
											)}
											{acc.ipfsRepoFound && (
												<UnifiedText
													style={[styles.text, text.bold, styles.textError]}
													numberOfLines={1}
												>
													{t('debug.inspector.accounts.status.ipfs-repo-found')}
												</UnifiedText>
											)}
											{acc.messengerDBFound && (
												<UnifiedText
													style={[styles.text, text.bold, styles.textError]}
													numberOfLines={1}
												>
													{t('debug.inspector.accounts.status.messenger-db-found')}
												</UnifiedText>
											)}
										</>
									)}
									{isMetaLoaded && !accountProtoEntries[acc.fileName].error && (
										<>
											{!acc.datastoreFound && (
												<UnifiedText
													style={[styles.text, text.bold, styles.textError]}
													numberOfLines={1}
												>
													{t('debug.inspector.accounts.status.datastore-not-found')}
												</UnifiedText>
											)}
											{!acc.ipfsRepoFound && (
												<UnifiedText
													style={[styles.text, text.bold, styles.textError]}
													numberOfLines={1}
												>
													{t('debug.inspector.accounts.status.ipfs-repo-not-found')}
												</UnifiedText>
											)}
											{!acc.messengerDBFound && (
												<UnifiedText
													style={[styles.text, text.bold, styles.textError]}
													numberOfLines={1}
												>
													{t('debug.inspector.accounts.status.messenger-db-not-found')}
												</UnifiedText>
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
	const { text } = useStyles()
	const dispatch = useAppDispatch()

	const refresh = useCallback(() => setLastUpdate(Date.now()), [setLastUpdate])

	return (
		<SafeAreaView style={[styles.safeViewContainer]}>
			<StatusBar backgroundColor='black' barStyle='light-content' />
			<View style={{ paddingHorizontal: 12, flexDirection: 'column' }}>
				<UnifiedText style={[styles.text, text.bold, styles.header1]}>
					{t('debug.inspector.title')}
				</UnifiedText>

				<View style={{ paddingVertical: 12 }}>
					<UnifiedText style={[styles.text, text.bold, styles.header2]}>
						{t('debug.inspector.errors.title')}
					</UnifiedText>
					{error ? (
						<View style={[styles.button]}>
							<UnifiedText style={[styles.text]}>
								❌ {t('debug.inspector.errors.header-reported')}
							</UnifiedText>
							<UnifiedText style={[text.bold]}>{error.message}</UnifiedText>
							<UnifiedText>{error.stack}</UnifiedText>
						</View>
					) : (
						<UnifiedText style={[styles.text, text.bold, styles.button]}>
							✅ {t('debug.inspector.errors.header-all-clear')}
						</UnifiedText>
					)}
				</View>
			</View>

			<ScrollView style={[styles.page]} contentContainerStyle={{ paddingBottom: 30 }}>
				<UnifiedText style={[styles.text, styles.header2]}>
					{t('debug.inspector.accounts.title')}
				</UnifiedText>
				{embedded ? (
					<AccountsInspector lastRefresh={lastUpdate} setLastUpdate={setLastUpdate} />
				) : (
					<UnifiedText style={[styles.text]}>
						❌ {t('debug.inspector.accounts.unsupported-remote-mode')}
					</UnifiedText>
				)}
			</ScrollView>
			<View style={{ position: 'absolute', bottom: 30, left: 0, right: 0 }}>
				<View style={{ flexDirection: 'row', paddingHorizontal: 12 }}>
					<TouchableOpacity onPress={refresh} style={{ flex: 1 }}>
						<View style={[styles.footerButton]}>
							<UnifiedText style={[styles.text, text.bold, { textAlign: 'center' }]}>
								{t('debug.inspector.refresh')}
							</UnifiedText>
						</View>
					</TouchableOpacity>
					{/*<ExportAllAppData />*/}
					<TouchableOpacity onPress={() => dispatch(setDebugMode(false))} style={{ flex: 1 }}>
						<View style={[styles.footerButton]}>
							<UnifiedText style={[styles.text, text.bold, { textAlign: 'center' }]}>
								{t('debug.inspector.hide-button')}
							</UnifiedText>
						</View>
					</TouchableOpacity>
				</View>
			</View>
		</SafeAreaView>
	)
}

export default AppInspector
