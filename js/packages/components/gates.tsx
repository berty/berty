import React from 'react'
import { ActivityIndicator, Button, Text, TextInput, View, Image, StatusBar } from 'react-native'
import * as Progress from 'react-native-progress'

import { useMsgrContext, useThemeColor } from '@berty-tech/store/hooks'
import {
	isClosing,
	isDeletingState,
	isReadyingBasics,
	MessengerActions,
	MessengerAppState,
} from '@berty-tech/store/context'
import { useStyles } from '@berty-tech/styles'
import source from '@berty-tech/assets/loader_dots.gif'

const expandSelfAndCenterContent: any = {
	alignItems: 'center',
	justifyContent: 'center',
	paddingBottom: 30,
	height: '100%',
	width: '100%',
}

const LoaderDots: React.FC = () => {
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
	const [{ text }] = useStyles()
	const colors = useThemeColor()
	const { streamInProgress: stream } = useMsgrContext()

	return (
		<View style={{ backgroundColor: colors['main-background'] }}>
			<StatusBar backgroundColor={colors['main-background']} barStyle='dark-content' />
			<Text
				style={[
					text.bold.small,
					text.align.center,
					{ marginTop: 60, fontFamily: 'Open Sans', color: colors['main-text'] },
				]}
			>
				{stream?.stream}
			</Text>
			<View style={[expandSelfAndCenterContent]}>
				<Text
					style={[
						text.bold.small,
						text.align.center,
						{ fontFamily: 'Open Sans', color: colors['main-text'] },
					]}
				>
					{stream?.msg?.progress?.doing}
				</Text>
				<Text
					style={[
						text.bold.small,
						text.align.center,
						{ fontFamily: 'Open Sans', color: colors['main-text'] },
					]}
				>
					{stream?.msg?.progress?.completed} / {stream?.msg?.progress?.total}
				</Text>
				<Progress.Bar progress={stream?.msg?.progress?.progress} width={200} />
			</View>
		</View>
	)
}

const gutter = 50

export const StreamGate: React.FC = ({ children }) => {
	const {
		streamError,
		daemonAddress,
		embedded,
		dispatch,
		streamInProgress,
		deleteAccount,
		restart,
	} = useMsgrContext()
	const [newAddress, setNewAddress] = React.useState(daemonAddress)
	const colors = useThemeColor()
	const changeAddress = React.useCallback(() => {
		dispatch({ type: MessengerActions.SetDaemonAddress, payload: { value: newAddress } })
	}, [dispatch, newAddress])

	if (streamError && !streamInProgress) {
		return (
			<View style={[expandSelfAndCenterContent, { padding: gutter }]}>
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
	const ctx = useMsgrContext()
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
	const ctx = useMsgrContext()
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
		<View style={[expandSelfAndCenterContent, { padding: gutter }]}>
			<Text>{text}</Text>
			<ActivityIndicator style={{ marginTop: gutter }} size='large' />
		</View>
	)
}

export const DeleteGate: React.FC = ({ children }) => {
	const ctx = useMsgrContext()

	if (ctx && isDeletingState(ctx.appState)) {
		return <DeleteProgressScreen />
	} else {
		return <>{children}</>
	}
}
