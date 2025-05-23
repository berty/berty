import { Icon } from '@ui-kitten/components'
import React from 'react'
import { StyleSheet, View } from 'react-native'

import beapi from '@berty/api'
import { useThemeColor } from '@berty/hooks'

import { IMemberStatus, IMemberTransports, IMemberUserTypes } from './interfaces'

export const MemberTransport: React.FC<IMemberStatus & IMemberTransports & IMemberUserTypes> = ({
	memberStatus,
	memberTransport,
	memberUserType,
}) => {
	const colors = useThemeColor()

	const iconSize = 16
	let iconColor
	switch (memberStatus) {
		case beapi.protocol.GroupDeviceStatus.Type.TypePeerConnected:
			iconColor = colors['background-header']
			break
		case beapi.protocol.GroupDeviceStatus.Type.TypePeerReconnecting:
			iconColor = '#FF9900'
			break
		case beapi.protocol.GroupDeviceStatus.Type.TypePeerDisconnected:
			iconColor = '#9E9FA8'
			break
	}

	let icon = memberUserType === 'replication' ? 'transport-node' : ''
	if (!icon.length) {
		switch (memberTransport) {
			case beapi.messenger.StreamEvent.PeerStatusConnected.Transport.Proximity:
				icon = 'transport-ble'
				break
			case beapi.messenger.StreamEvent.PeerStatusConnected.Transport.LAN:
				icon = 'transport-wifi'
				break
			case beapi.messenger.StreamEvent.PeerStatusConnected.Transport.WAN:
				icon = 'transport-4g'
				break
			case beapi.messenger.StreamEvent.PeerStatusConnected.Transport.Unknown:
				icon = ''
				break
		}
	}

	return icon ? (
		<View style={[styles.container]}>
			<Icon pack='custom' name={icon} width={iconSize} height={iconSize} fill={iconColor} />
		</View>
	) : null
}
const containerSize = 28
const styles = StyleSheet.create({
	container: {
		width: containerSize,
		height: containerSize,
		borderRadius: containerSize,
		backgroundColor: '#E9EAF1',
		justifyContent: 'center',
		alignItems: 'center',
	},
})
