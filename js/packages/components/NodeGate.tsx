import React from 'react'
import { Chat, Settings } from '@berty-tech/hooks'
import { Text, View, ActivityIndicator } from 'react-native'

const NodeGate: React.FC = ({ children }) => {
	const client = Chat.useClient()
	const settings = Settings.useSettings()
	const account = Chat.useAccount()
	return account?.onboarded && !client ? (
		<View style={{ height: '100%', justifyContent: 'center', alignItems: 'center' }}>
			<Text style={{ marginBottom: 20 }}>
				{settings?.nodeConfig.type === 'embedded' ? 'Starting' : 'Connecting to'} Berty node..
			</Text>
			<ActivityIndicator size='large' />
		</View>
	) : (
		<>{children}</>
	)
}

export default NodeGate
