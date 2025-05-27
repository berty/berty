import React from 'react'
import { StyleSheet, View } from 'react-native'

import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'

export const TextPriv: React.FC<{}> = props => {
	const { margin } = useStyles()

	return (
		<View style={styles.container}>
			<UnifiedText numberOfLines={1} style={[margin.left.small]}>
				{props.children}
			</UnifiedText>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		width: '90%',
		flexShrink: 1,
	},
})
