import React from 'react'
import {
	ActivityIndicator,
	Button,
	TextInput,
	View,
	Image,
	StatusBar,
	Platform,
} from 'react-native'
import * as Progress from 'react-native-progress'
import { useSelector } from 'react-redux'

import { useAppDispatch } from '@berty/hooks'
import { useThemeColor } from '@berty/store'
import source from '@berty/assets/images/loader_dots.gif'
import {
	selectDaemonAddress,
	selectEmbedded,
	selectMessengerisClosing,
	selectMessengerIsReadyingBasics,
	selectStreamError,
	selectStreamInProgress,
	setDaemonAddress,
} from '@berty/redux/reducers/ui.reducer'
import { useStyles } from '@berty/contexts/styles'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'
import { useDeleteAccount, useRestart } from '@berty/hooks'

import { UnifiedText } from './shared-components/UnifiedText'

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
	const { text } = useStyles()
	const { scaleSize } = useAppDimensions()
	const colors = useThemeColor()
	const stream = useSelector(selectStreamInProgress)

	return (
		<View style={{ backgroundColor: colors['main-background'], flex: 1 }}>
			<StatusBar backgroundColor={colors['main-background']} barStyle='dark-content' />

			<UnifiedText
				style={[
					text.align.center,
					{
						position: 'absolute',
						top: 60 * scaleSize,
						left: 0,
						right: 0,
					},
				]}
			>
				{stream?.stream || 'Test'}
			</UnifiedText>
			<View
				style={{
					flex: 1,
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<UnifiedText style={[text.align.center]}>{stream?.msg.doing || 'Doing'}</UnifiedText>
				<UnifiedText style={[text.align.center]}>
					{stream?.msg.completed || '0'} / {stream?.msg.total || '6'}
				</UnifiedText>
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
	const streamInProgress = useSelector(selectStreamInProgress)
	const embedded = useSelector(selectEmbedded)
	const streamError = useSelector(selectStreamError)
	const deleteAccount = useDeleteAccount()
	const daemonAddress = useSelector(selectDaemonAddress)
	const dispatch = useAppDispatch()
	const restart = useRestart()

	const [newAddress, setNewAddress] = React.useState(daemonAddress)
	const colors = useThemeColor()
	const changeAddress = React.useCallback(() => {
		dispatch(setDaemonAddress({ value: newAddress }))
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
				<UnifiedText style={{ color: colors['warning-asset'] }}>
					{streamError.toString()}
				</UnifiedText>
				<UnifiedText style={{ marginTop: gutter }}>
					Likely couldn't connect to the node, or the connection dropped
				</UnifiedText>
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
