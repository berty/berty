import { Icon } from '@ui-kitten/components'
import React from 'react'
import { StyleSheet, View } from 'react-native'

import { useThemeColor } from '@berty/hooks'

import { TextPriv } from './Text.priv'

interface IconWithTextPrivProps {
	iconName: string
	pack?: string
	color?: string
}

export const IconWithTextPriv: React.FC<IconWithTextPrivProps> = props => {
	const colors = useThemeColor()
	return (
		<View style={styles.row}>
			<Icon
				name={props.iconName}
				pack={props.pack}
				width={20}
				height={20}
				fill={props.color ?? colors['main-text']}
			/>
			<TextPriv>{props.children}</TextPriv>
		</View>
	)
}

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
	},
})
