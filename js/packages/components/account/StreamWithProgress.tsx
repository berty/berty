import React from 'react'
import { ActivityIndicator, Button, TextInput, View, StatusBar, Platform } from 'react-native'
import * as Progress from 'react-native-progress'
import { useSelector } from 'react-redux'

import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'
import { useStyles } from '@berty/contexts/styles'
import { useAppDispatch, useRestart } from '@berty/hooks'
import { useDeleteAccount } from '@berty/hooks'
import {
	selectDaemonAddress,
	selectStreamError,
	selectStreamInProgress,
	setDaemonAddress,
} from '@berty/redux/reducers/ui.reducer'
import { useThemeColor } from '@berty/store'

const StreamWithProgressCmp: React.FC<{}> = () => {
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

export const StreamWithProgress = () => {
	const streamInProgress = useSelector(selectStreamInProgress)
	const streamError = useSelector(selectStreamError)
	const deleteAccount = useDeleteAccount()
	const daemonAddress = useSelector(selectDaemonAddress)
	const dispatch = useAppDispatch()
	const restart = useRestart()

	const colors = useThemeColor()

	const [newAddress, setNewAddress] = React.useState(daemonAddress)

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
				<>
					<TextInput
						onChangeText={setNewAddress}
						value={newAddress}
						style={{ backgroundColor: colors['secondary-text'] }}
					/>
					<Button title='Change node address' onPress={changeAddress} />
				</>
				<View style={{ marginTop: gutter }}>
					<Button onPress={() => restart()} title='Restart' />
				</View>
				<View style={{ marginTop: gutter }}>
					<Button onPress={() => deleteAccount()} title='Delete account' />
				</View>
			</View>
		)
	}
	return <StreamWithProgressCmp />
}
