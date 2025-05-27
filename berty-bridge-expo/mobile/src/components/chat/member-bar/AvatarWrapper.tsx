import React from 'react'
import { StyleSheet, View } from 'react-native'

import beapi from '@berty/api'
import { MemberAvatar } from '@berty/components/avatars'

import { MemberBarItem } from './interfaces'

export const AvatarWrapper: React.FC<{ member: MemberBarItem; convId: string; index: number }> =
	props => {
		return (
			<View
				style={[
					styles.avatarWrapper,
					{
						zIndex: props.index,
						opacity:
							props.member.alreadyConnected &&
							props.member.networkStatus.connectionStatus !==
								beapi.protocol.GroupDeviceStatus.Type.TypePeerConnected
								? 0.3
								: 1,
					},
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
