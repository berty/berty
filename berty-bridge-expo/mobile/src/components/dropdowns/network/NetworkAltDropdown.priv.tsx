import React, { ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'

import { useThemeColor } from '@berty/hooks'

import { DropdownPriv } from '../Dropdown.priv'
import { NetworkProps } from './interfaces'

interface NetworkAltDropdownPrivProps extends NetworkProps {
	placeholder: string
	children: ReactNode
}

export const NetworkAltDropdownPriv: React.FC<NetworkAltDropdownPrivProps> = props => {
	const colors = useThemeColor()
	return (
		<View style={[styles.container, { backgroundColor: colors['main-background'] }]}>
			<DropdownPriv placeholder={props.placeholder} testID={props.testID}>
				{props.children}
			</DropdownPriv>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		borderRadius: 14,
		flex: 1,
	},
})
