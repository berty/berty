import React from 'react'
import { StyleSheet } from 'react-native'

import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'

export const TextButtonPriv: React.FC<{ color: string }> = props => {
	const { text } = useStyles()

	return (
		<UnifiedText style={[styles.text, { color: props.color }, text.bold]}>
			{props.children}
		</UnifiedText>
	)
}

const styles = StyleSheet.create({
	text: {
		textTransform: 'uppercase',
	},
})
