import { Icon } from '@ui-kitten/components'
import React from 'react'
import { StyleSheet, View } from 'react-native'

import { TextPriv } from './Text.priv'

interface IconWithTextPrivProps {
	iconName: string
	pack?: string
	color?: string
}

export const IconWithTextPriv: React.FC<IconWithTextPrivProps> = props => {
	return (
		<View style={styles.row}>
			<Icon
				name={props.iconName}
				pack={props.pack}
				width={20}
				height={20}
				fill={props.color ?? '#393C63'}
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
