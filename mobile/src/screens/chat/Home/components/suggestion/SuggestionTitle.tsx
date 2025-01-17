import React from 'react'
import { StyleSheet, View } from 'react-native'

import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'

export const SuggestionTitle: React.FC<{ displayName: string }> = ({ displayName }) => {
	const { flex } = useStyles()

	return (
		<View style={[flex.direction.row, flex.justify.start]}>
			<View style={styles.title}>
				<UnifiedText numberOfLines={1}>{displayName}</UnifiedText>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	title: {
		flexShrink: 1,
	},
})
