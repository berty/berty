import React, { useCallback, useEffect, useState } from 'react'
import { View, Text, Platform, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native'
import RNFS from 'react-native-fs'
import { berty } from '@berty-tech/api/root.pb'
import { GRPCError, Service } from '@berty-tech/grpc-bridge'
import beapi from '@berty-tech/api'
import { bridge as rpcBridge } from '@berty-tech/grpc-bridge/rpc'
import { useTranslation } from 'react-i18next'
import { useMsgrContext } from '@berty-tech/store/context'
import { SafeAreaView } from 'react-native-safe-area-context'

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

const confirmActionWrapper = (title: string, action: () => void) => () => {
	Alert.alert(title, '', [
		{
			text: 'Confirm',
			onPress: action,
			style: 'destructive',
		},
		{
			text: 'Cancel',
			onPress: () => {},
			style: 'cancel',
		},
	])
}

const fetchFSAccountList = (updateAccountFSFiles: (arg: Array<string>) => void) => {
	const f = async () => {
		const files = await RNFS.readDir(getRootDir())

		updateAccountFSFiles(files.map((item) => item.name).sort())
	}

	f().catch((err: Error) => {
		console.warn(err)
		Alert.alert('Error while listing directory contents', err.message)
	})
}

const fetchProtoAccountList = (
	updateAccountProtoEntries: (arg: { [key: string]: berty.account.v1.IAccountMetadata }) => void,
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
			Alert.alert('GRPCError while listing accounts', err.error.message)
		} else {
			Alert.alert('Error while listing accounts', err.message)
		}
	})
}

const accountAction = async (
	accountId: string,
	setLastUpdate: React.Dispatch<React.SetStateAction<number>>,
) => {
	let title = 'Account ' + accountId + ' does not exists, a directory has this name though.'

	try {
		const stat = await RNFS.stat(getRootDir() + '/' + accountId)
		if (stat.isFile()) {
			title = 'Account ' + accountId + ' does not exists, a file has this name though.'
		}
	} catch (err) {
		console.warn(err)
		Alert.alert('Error while getting FS info about account', err.message)
		return
	}

	Alert.alert(title, 'What should we do?', [
		{
			text: 'Delete it via account manager',
			onPress: confirmActionWrapper('Confirm deletion of account', () => {
				// close account if necessary
				accountService
					.closeAccount({})
					.catch((err: Error) => {
						console.warn(err)
						Alert.alert('Error while closing account', err.message)
					})
					// delete account
					.then(() => accountService.deleteAccount({ accountId: accountId }))
					.then(() => Alert.alert('Account deleted'))
					.catch((err: Error) => {
						console.warn(err)
						Alert.alert('Error while deleting account', err.message)
					})
					.finally(() => setLastUpdate(Date.now()))
			}),
			style: 'destructive',
		},
		{
			text: 'Force delete it',
			onPress: confirmActionWrapper('Confirm force deletion of account', () => {
				RNFS.unlink(getRootDir() + '/' + accountId)
					.catch((err: Error) => {
						console.warn(err)
						Alert.alert('Unable to remove account', err.message)
					})
					.finally(() => setLastUpdate(Date.now()))
			}),
			style: 'destructive',
		},
		{
			text: 'Nothing',
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
	const [accountFSFiles, updateAccountFSFiles] = useState<Array<string>>([])
	const [accountProtoEntries, updateAccountProtoEntries] = useState<{
		[key: string]: berty.account.v1.IAccountMetadata
	}>({})
	const { t }: { t: any } = useTranslation()

	useEffect(() => fetchFSAccountList(updateAccountFSFiles), [updateAccountFSFiles, lastRefresh])
	useEffect(() => fetchProtoAccountList(updateAccountProtoEntries), [
		updateAccountProtoEntries,
		lastRefresh,
	])

	return (
		<>
			{accountFSFiles.map((acc) => (
				<TouchableOpacity key={acc} onPress={() => accountAction(acc, setLastUpdate)}>
					<View style={[{ paddingBottom: 2, paddingTop: 2 }, styles.button]}>
						<Text numberOfLines={1} style={[styles.bold, styles.text]}>
							{acc}
						</Text>
						<View>
							{accountProtoEntries.hasOwnProperty(acc) ? (
								<>
									{accountProtoEntries[acc].name ? (
										<Text numberOfLines={1} style={[styles.text]}>
											Name:{'    '}
											{accountProtoEntries[acc].name}
										</Text>
									) : null}
									{accountProtoEntries[acc].creationDate ? (
										<Text numberOfLines={1} style={[styles.text]}>
											Created:{' '}
											{new Date(
												parseInt(accountProtoEntries[acc].creationDate, 10) / 1000,
											).toUTCString()}
										</Text>
									) : null}

									{accountProtoEntries[acc].lastOpened ? (
										<Text numberOfLines={1} style={[styles.text]}>
											Opened:{'  '}
											{new Date(
												parseInt(accountProtoEntries[acc].lastOpened, 10) / 1000,
											).toUTCString()}
										</Text>
									) : null}
									{accountProtoEntries[acc].error ? (
										<Text numberOfLines={1} style={[styles.text]}>
											Error: {accountProtoEntries[acc].error}
										</Text>
									) : null}
								</>
							) : (
								<Text numberOfLines={1} style={[styles.text, styles.textError]}>
									{t('debug.inspector.accounts.data-not-found')}
								</Text>
							)}
						</View>
					</View>
				</TouchableOpacity>
			))}
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
