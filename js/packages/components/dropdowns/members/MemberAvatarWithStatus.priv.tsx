import React from 'react'
import { View, StyleSheet } from 'react-native'

import beapi from '@berty/api'
import { MemberAvatar } from '@berty/components/avatars'
import { Maybe } from '@berty/utils/type/maybe'

import { IMemberStatus } from './interfaces'

interface MemberAvatarWithStatusProps extends IMemberStatus {
	publicKey: Maybe<string>
	convPK: Maybe<string>
}

const MemberStatus: React.FC<IMemberStatus> = ({ memberStatus }) => {
	let backgroundColor
	switch (memberStatus) {
		case beapi.protocol.GroupDeviceStatus.Type.TypePeerConnected:
			backgroundColor = '#4CD31D'
			break
		case beapi.protocol.GroupDeviceStatus.Type.TypePeerReconnecting:
			backgroundColor = '#FF9900'
			break
		case beapi.protocol.GroupDeviceStatus.Type.TypePeerDisconnected:
			backgroundColor = '#AFAFAF'
			break
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
}) => {
	return (
		<>
			<MemberAvatar publicKey={publicKey} conversationPublicKey={convPK} size={32} />
			<MemberStatus memberStatus={memberStatus} />
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
