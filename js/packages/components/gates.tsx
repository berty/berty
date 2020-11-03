import React from 'react'
import { ActivityIndicator, Button, Image, Text, TextInput, View } from 'react-native'

import { useDeleteAccount, useMsgrContext, useRestart } from '@berty-tech/store/hooks'

import LoaderDots from './shared-components/loader_dots.gif'
import {
	isClosing,
	isDeletingState,
	isReadyingBasics,
	MessengerActions,
	MessengerAppState,
} from '@berty-tech/store/context'

const expandSelfAndCenterContent: any = {
	alignItems: 'center',
	justifyContent: 'center',
	height: '100%',
	width: '100%',
}

const gutter = 50

export const StreamGate: React.FC = ({ children }) => {
	const { streamError, daemonAddress, embedded, dispatch } = useMsgrContext()
	const [newAddress, setNewAddress] = React.useState(daemonAddress)
	const changeAddress = React.useCallback(() => {
		dispatch({ type: MessengerActions.SetDaemonAddress, payload: { value: newAddress } })
	}, [dispatch, newAddress])
	const restart = useRestart()
	const deleteAccount = useDeleteAccount()

	if (streamError) {
		return (
			<View style={[expandSelfAndCenterContent, { padding: gutter }]}>
				<Text style={{ color: 'red' }}>{streamError.toString()}</Text>
				<Text style={{ marginTop: gutter }}>
					Likely couldn't connect to the node, or the connection dropped
				</Text>
				{embedded || (
					<>
						<TextInput
							onChangeText={setNewAddress}
							value={newAddress}
							style={{ backgroundColor: 'grey' }}
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
	}
	return <>{children}</>
}

export const ListGate: React.FC = ({ children }) => {
	const ctx = useMsgrContext()

	if (ctx && !isClosing(ctx.appState) && !isReadyingBasics(ctx.appState)) {
		return <>{children}</>
	}

	return (
		<View style={expandSelfAndCenterContent}>
			<Image source={LoaderDots} style={{ width: 170, height: 80 }} />
		</View>
	)
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
