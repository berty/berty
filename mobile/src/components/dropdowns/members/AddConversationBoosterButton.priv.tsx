import { Icon } from '@ui-kitten/components'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import beapi from '@berty/api'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'

import { MemberTransport } from './MemberTransport.priv'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AddConversationBoosterButton: React.FC = () => {
	const colors = useThemeColor()
	const { padding, margin } = useStyles()
	const { t } = useTranslation()

	return (
		<TouchableOpacity style={[padding.medium, styles.container]}>
			<View style={[styles.content]}>
				<MemberTransport
					memberStatus={beapi.protocol.GroupDeviceStatus.Type.TypePeerConnected}
					memberUserType='replication'
				/>
				<UnifiedText style={[margin.left.medium]}>
					{t('chat.multi-member-settings.members-dropdown.conversation-booster')}
				</UnifiedText>
			</View>
			<Icon name='arrow-ios-forward' width={20} height={20} fill={colors['main-text']} />
		</TouchableOpacity>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	content: {
		flexDirection: 'row',
		alignItems: 'center',
	},
})
