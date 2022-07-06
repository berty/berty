import { Icon } from '@ui-kitten/components'
import React from 'react'
import { StyleSheet, View } from 'react-native'

import { useThemeColor } from '@berty/hooks'

import { IMemberStatus, IMemberTransports } from './interfaces'

export const MemberTransport: React.FC<IMemberStatus & IMemberTransports> = ({
	memberStatus,
	memberTransport,
}) => {
	const colors = useThemeColor()

	const iconSize = 16
	let iconColor
	switch (memberStatus) {
		case 'connected':
			iconColor = colors['background-header']
			break
		case 'disconnected':
			iconColor = '#9E9FA8'
			break
		case 'reconnecting':
			iconColor = '#FF9900'
			break
	}
	return (
		<View style={[styles.container]}>
			<Icon
				pack='custom'
				name={`transport-${memberTransport}`}
				width={iconSize}
				height={iconSize}
				fill={iconColor}
			/>
		</View>
	)
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
