import React from 'react'
import { Messenger, Settings } from '@berty-tech/hooks'
import { Text, View, ActivityIndicator } from 'react-native'
import { useStyles } from '@berty-tech/styles'

const NodeGate: React.FC = ({ children }) => {
	const [{ flex, margin }] = useStyles()
	const client = Messenger.useClient()
	const settings = Settings.useSettings()
	const account = Messenger.useAccount()
	return account?.onboarded && !client ? (
		<View style={[{ height: '100%' }, flex.justify.center, flex.align.center]}>
			<Text style={[margin.bottom.scale(20)]}>
				{settings?.nodeConfig.type === 'embedded' ? 'Starting' : 'Connecting to'} Berty node..
			</Text>
			<ActivityIndicator size='large' />
		</View>
	) : (
		<>{children}</>
	)
}

export default NodeGate
