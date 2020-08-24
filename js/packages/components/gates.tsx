import React from 'react'
import { Text, Button, View, ActivityIndicator } from 'react-native'

import { useMsgrContext } from '@berty-tech/store/hooks'

const expandSelfAndCenterContent: any = {
	alignItems: 'center',
	justifyContent: 'center',
	height: '100%',
	width: '100%',
}

const gutter = 50

export const StreamGate: React.FC = ({ children }) => {
	const { streamError, restart } = useMsgrContext()
	// FIXME: reset nav and state during restartStream
	if (streamError) {
		return (
			<View style={[expandSelfAndCenterContent, { padding: gutter }]}>
				<Text style={{ color: 'red' }}>{streamError.toString()}</Text>
				<Text style={{ marginTop: gutter }}>
					Likely couldn't connect to the node, or the connection droped
				</Text>
				<View style={{ marginTop: gutter }}>
					<Button onPress={restart} title='Restart' />
				</View>
			</View>
		)
	}
	return <>{children}</>
}

export const ListGate: React.FC = ({ children }) => {
	const ctx = useMsgrContext()
	if (ctx && ctx.listDone) {
		return <>{children}</>
	} else {
		return (
			<View style={expandSelfAndCenterContent}>
				<Text>Starting node and loading content..</Text>
				<ActivityIndicator size='large' style={{ marginTop: gutter }} />
			</View>
		)
	}
}

const DeleteProgressScreen = () => {
	const ctx = useMsgrContext()
	let text = 'Unknown state'
	switch (ctx.deleteState) {
		case 'STOPPING_DAEMON':
			text = 'Stopping node..'
			break
		case 'CLEARING_STORAGE':
			text = 'Clearing storage..'
			break
		case 'DONE':
			text = 'Your account was deleted'
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
	if (ctx && ctx.deleteState) {
		return <DeleteProgressScreen />
	} else {
		return <>{children}</>
	}
}
