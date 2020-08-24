import React from 'react'
// import { Messenger, Settings } from '@berty-tech/store/oldhooks'
import { Text, View, ActivityIndicator } from 'react-native'

const NodeGate: React.FC = ({ children }) => {
	//const client = Messenger.useClient()
	//const settings = Settings.useSettings()
	//const account = Messenger.useAccount()
	//const shouldWait = account?.onboarded && !client
	const shouldWait = false
	const settings = { nodeConfig: { type: 'embedded' } }
	return shouldWait ? (
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
