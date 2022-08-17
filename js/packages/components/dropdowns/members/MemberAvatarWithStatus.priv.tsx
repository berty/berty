import React from 'react'
import { View, StyleSheet } from 'react-native'

import beapi from '@berty/api'
import { MemberAvatar } from '@berty/components/avatars'
import { Maybe } from '@berty/utils/type/maybe'

import { IMemberStatus } from './interfaces'

interface MemberAvatarWithStatusProps extends IMemberStatus {
	publicKey: Maybe<string>
	convPK: Maybe<string>
	isMe: boolean | null | undefined
}

interface MemberStatusProps extends IMemberStatus {
	isMe: boolean | null | undefined
}

const connectedStatusColor = '#4CD31D'
const reconnectingStatusColor = '#FF9900'
const disconnectedStatusColor = '#AFAFAF'

const MemberStatus: React.FC<MemberStatusProps> = ({ memberStatus, isMe }) => {
	let backgroundColor
	switch (memberStatus) {
		case beapi.protocol.GroupDeviceStatus.Type.TypePeerConnected:
			backgroundColor = connectedStatusColor
			break
		case beapi.protocol.GroupDeviceStatus.Type.TypePeerReconnecting:
			backgroundColor = reconnectingStatusColor
			break
		case beapi.protocol.GroupDeviceStatus.Type.TypePeerDisconnected:
			backgroundColor = disconnectedStatusColor
			break
	}

	// overwrite backgroundColor as connected if it's you
	if (isMe) {
		backgroundColor = connectedStatusColor
	}

	return (
		<View style={[styles.container]}>
			<View style={[styles.status, { backgroundColor }]} />
		</View>
	)
}

export const MemberAvatarWithStatus: React.FC<MemberAvatarWithStatusProps> = ({
	publicKey,
	convPK,
	memberStatus,
	isMe,
}) => {
	return (
		<>
			<MemberAvatar publicKey={publicKey} conversationPublicKey={convPK} size={32} />
			<MemberStatus memberStatus={memberStatus} isMe={isMe} />
		</>
	)
}

const size = 8
const containerSize = size + 4
const styles = StyleSheet.create({
	container: {
		position: 'relative',
		borderRadius: containerSize,
		width: containerSize,
		height: containerSize,
		top: 10,
		right: 10,
		backgroundColor: '#FFFFFF',
		justifyContent: 'center',
	},
	status: {
		borderRadius: size,
		width: size,
		height: size,
		alignSelf: 'center',
	},
})
