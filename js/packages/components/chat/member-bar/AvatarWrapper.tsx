import React from 'react'
import { StyleSheet, View } from 'react-native'

import beapi from '@berty/api'
import { MemberAvatar } from '@berty/components/avatars'

import { MemberBarItem } from './interfaces'

export const AvatarWrapper: React.FC<{ member: MemberBarItem; convId: string; index: number }> =
	props => {
		let borderColor = '#8E8E92'
		if (
			props.member.networkStatus?.connectionStatus ===
			beapi.protocol.GroupDeviceStatus.Type.TypePeerConnected
		) {
			borderColor = '#0FBE00'
		}
		if (
			props.member.networkStatus?.connectionStatus ===
			beapi.protocol.GroupDeviceStatus.Type.TypePeerReconnecting
		) {
			borderColor = '#F9B70F'
		}

		return (
			<View
				style={[
					styles.avatarWrapper,
					{ borderColor, backgroundColor: '#FFFFFF', zIndex: props.index },
				]}
			>
				<MemberAvatar
					publicKey={props.member.publicKey}
					conversationPublicKey={props.convId}
					size={26}
				/>
			</View>
		)
	}

const styles = StyleSheet.create({
	avatarWrapper: {
		width: 32,
		height: 32,
		borderRadius: 32,
		borderColor: 'white',
		borderWidth: 1.5,
		justifyContent: 'center',
		alignItems: 'center',
		marginLeft: -10,
	},
})
