import React from 'react'
import {
	Platform,
	ActivityIndicator,
	Button,
	Text,
	TextInput,
	View,
	Image,
	StatusBar,
	Alert,
} from 'react-native'
import * as Progress from 'react-native-progress'

import {
	MessengerAppState,
	useMessengerContext,
	useThemeColor,
	isClosing,
	isDeletingState,
	isReadyingBasics,
	MessengerActions,
} from '@berty-tech/store'
import { useStyles } from '@berty-tech/styles'
import source from '@berty-tech/assets/loader_dots.gif'
import { Service } from '@berty-tech/grpc-bridge'
import beapi from '@berty-tech/api'
import rpcBridge from '@berty-tech/grpc-bridge/rpc/rpc.bridge'
import { logger } from '@berty-tech/grpc-bridge/middleware'
import ExternalTransport from '@berty-tech/store/externalTransport'
import { grpcweb as rpcWeb } from '@berty-tech/grpc-bridge/rpc'

export const LoaderDots: React.FC = () => {
	const colors = useThemeColor()

	return (
		<View
			style={{
				alignItems: 'center',
				justifyContent: 'center',
				height: '100%',
				width: '100%',
				backgroundColor: colors['main-background'],
			}}
		>
			<StatusBar backgroundColor={colors['main-background']} barStyle='dark-content' />
			<Image source={source} style={{ width: 170, height: 80 }} />
		</View>
	)
}

const StreamInProgressCmp: React.FC<{}> = () => {
	const [{ text }, { scaleSize }] = useStyles()
	const colors = useThemeColor()
	const { streamInProgress: stream } = useMessengerContext()

	return (
		<View style={{ backgroundColor: colors['main-background'], flex: 1 }}>
			<StatusBar backgroundColor={colors['main-background']} barStyle='dark-content' />

			<Text
				style={[
					text.bold.small,
					text.align.center,
					{
						fontFamily: 'Open Sans',
						color: colors['main-text'],
						position: 'absolute',
						top: 60 * scaleSize,
						left: 0,
						right: 0,
					},
				]}
			>
				{stream?.stream || 'Test'}
			</Text>
			<View
				style={{
					flex: 1,
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<Text
					style={[
						text.bold.small,
						text.align.center,
						{ fontFamily: 'Open Sans', color: colors['main-text'] },
					]}
				>
					{stream?.msg.doing || 'Doing'}
				</Text>
				<Text
					style={[
						text.bold.small,
						text.align.center,
						{ fontFamily: 'Open Sans', color: colors['main-text'] },
					]}
				>
					{stream?.msg.completed || '0'} / {stream?.msg.total || '6'}
				</Text>
				<Progress.Bar progress={stream?.msg.progress || 0} width={200} color='#3946E1' />
			</View>
		</View>
	)
}

const gutter = 50

export const StreamGate: React.FC = ({ children }) => {
	const { streamError, daemonAddress, dispatch, streamInProgress, deleteAccount, restart } =
		useMessengerContext()
	const [newAddress, setNewAddress] = React.useState(daemonAddress)
	const colors = useThemeColor()
	const embedded = Platform.OS !== 'web'

	const changeAddress = React.useCallback(() => {
		let bridge: unknown = rpcBridge

		if (newAddress !== '') {
			const opts = {
				transport: ExternalTransport(),
				host: newAddress,
			}
			bridge = rpcWeb(opts)
		} else if (!embedded && newAddress === '') {
			Alert.alert('An invalid address has been used')
			return
		}

		const accountClient = Service(beapi.account.AccountService, bridge, logger.create('ACCOUNT'))

		dispatch({
			type: MessengerActions.SetNextAccountClient,
			payload: {
				accountClient: accountClient,
				daemonAddress: newAddress,
			},
		})
	}, [dispatch, embedded, newAddress])

	if (streamError && !streamInProgress) {
		return (
			<View
				style={[
					{
						padding: gutter,
						alignItems: 'center',
						justifyContent: 'center',
						paddingBottom: 30,
						height: '100%',
						width: '100%',
					},
				]}
			>
				<StatusBar backgroundColor={colors['main-background']} barStyle='dark-content' />
				<Text style={{ color: colors['warning-asset'] }}>{streamError.toString()}</Text>
				<Text style={{ marginTop: gutter }}>
					Likely couldn't connect to the node, or the connection dropped
				</Text>
				{embedded || (
					<>
						<TextInput
							onChangeText={setNewAddress}
							value={newAddress}
							style={{ backgroundColor: colors['secondary-text'] }}
						/>
						<Button title='Change node address' onPress={changeAddress} />
					</>
				)}
				<View style={{ marginTop: gutter }}>
					<Button onPress={() => restart()} title='Restart' />
				</View>
				<View style={{ marginTop: gutter }}>
					<Button onPress={() => deleteAccount()} title='Delete account' />
				</View>
			</View>
		)
	} else if (streamInProgress?.msg) {
		return <StreamInProgressCmp />
	}
	return (
		<>
			<StatusBar backgroundColor={colors['main-background']} barStyle='dark-content' />
			{children}
		</>
	)
}

export const ListGate: React.FC = ({ children }) => {
	const ctx = useMessengerContext()
	const colors = useThemeColor()

	if (!isClosing(ctx.appState) && !isReadyingBasics(ctx.appState)) {
		return (
			<>
				<StatusBar backgroundColor={colors['main-background']} barStyle='dark-content' />
				{children}
			</>
		)
	}
	return <LoaderDots />
}

const DeleteProgressScreen = () => {
	const ctx = useMessengerContext()
	let text = 'Unknown state'
	switch (ctx.appState) {
		case MessengerAppState.DeletingClosingDaemon:
			text = 'Stopping node..'
			break
		case MessengerAppState.DeletingClearingStorage:
			text = 'Clearing storage..'
			break
	}

	return (
		<View
			style={[
				{
					padding: gutter,
					alignItems: 'center',
					justifyContent: 'center',
					paddingBottom: 30,
					height: '100%',
					width: '100%',
				},
			]}
		>
			<Text>{text}</Text>
			<ActivityIndicator style={{ marginTop: gutter }} size='large' />
		</View>
	)
}

export const DeleteGate: React.FC = ({ children }) => {
	const ctx = useMessengerContext()

	if (ctx && isDeletingState(ctx.appState)) {
		return <DeleteProgressScreen />
	} else {
		return <>{children}</>
	}
}
