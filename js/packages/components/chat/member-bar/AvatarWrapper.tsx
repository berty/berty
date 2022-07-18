import React from 'react'
import { StyleSheet, View } from 'react-native'

import beapi from '@berty/api'
import { MemberAvatar } from '@berty/components/avatars'

import { MemberBarItem } from './interfaces'

export const AvatarWrapper: React.FC<{ member: MemberBarItem; convId: string; index: number }> =
	props => {
		console.log('MEMBER', props.member)
		let backgroundColor = '#E35179'
		if (
			props.member.networkStatus?.connectionStatus ===
			beapi.protocol.GroupDeviceStatus.Type.TypePeerConnected
		) {
			backgroundColor = '#0FBE00'
		}
		if (
			props.member.networkStatus?.connectionStatus ===
			beapi.protocol.GroupDeviceStatus.Type.TypePeerReconnecting
		) {
			backgroundColor = '#F9B70F'
		}

		return (
			<View style={[styles.avatarWrapper, { backgroundColor, zIndex: props.index }]}>
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
		width: 30,
		height: 30,
		borderRadius: 30,
		borderColor: 'white',
		borderWidth: 1,
		justifyContent: 'center',
		alignItems: 'center',
		marginLeft: -10,
	},
})
