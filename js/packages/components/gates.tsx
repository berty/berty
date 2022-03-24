import React from 'react'
import {
	ActivityIndicator,
	Button,
	Text,
	TextInput,
	View,
	Image,
	StatusBar,
	Platform,
} from 'react-native'
import * as Progress from '@berty-tech/polyfill/react-native-progress'

import { useMessengerContext, useThemeColor, MessengerActions } from '@berty-tech/store'
import { useStyles } from '@berty-tech/styles'
import source from '@berty-tech/assets/loader_dots.gif'
import { useSelector } from 'react-redux'
import {
	MESSENGER_APP_STATE,
	selectAppState,
	selectEmbedded,
	selectMessengerisClosing,
	selectMessengerIsDeletingState,
	selectMessengerIsReadyingBasics,
	selectStreamInProgress,
} from '@berty-tech/redux/reducers/ui.reducer'

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
			<Image
				source={source}
				style={{ width: '80%', height: '40%', maxWidth: 170, maxHeight: 80 }}
			/>
		</View>
	)
}

const StreamInProgressCmp: React.FC<{}> = () => {
	const [{ text }, { scaleSize }] = useStyles()
	const colors = useThemeColor()
	const stream = useSelector(selectStreamInProgress)

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
				{Platform.OS === 'web' ? (
					<ActivityIndicator size='large' />
				) : (
					<Progress.Bar progress={stream?.msg.progress || 0} width={200} color='#3946E1' />
				)}
			</View>
		</View>
	)
}

const gutter = 50

export const StreamGate: React.FC = ({ children }) => {
	const { streamError, daemonAddress, dispatch, deleteAccount, restart } = useMessengerContext()
	const streamInProgress = useSelector(selectStreamInProgress)
	const embedded = useSelector(selectEmbedded)

	const [newAddress, setNewAddress] = React.useState(daemonAddress)
	const colors = useThemeColor()
	const changeAddress = React.useCallback(() => {
		dispatch({ type: MessengerActions.SetDaemonAddress, payload: { value: newAddress } })
	}, [dispatch, newAddress])

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
	const colors = useThemeColor()
	const isClosing = useSelector(selectMessengerisClosing)
	const isReadyingBasics = useSelector(selectMessengerIsReadyingBasics)

	if (!isClosing && !isReadyingBasics) {
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
	const appState = useSelector(selectAppState)
	let text = 'Unknown state'
	switch (appState) {
		case MESSENGER_APP_STATE.DELETING_CLOSING_DAEMON:
			text = 'Stopping node..'
			break
		case MESSENGER_APP_STATE.DELETING_CLEARING_STORAGE:
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
	const isDeletingState = useSelector(selectMessengerIsDeletingState)

	if (isDeletingState) {
		return <DeleteProgressScreen />
	} else {
		return <>{children}</>
	}
}
