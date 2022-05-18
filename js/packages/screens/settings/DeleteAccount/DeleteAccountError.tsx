import React from 'react'
import { View } from 'react-native'

import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/store'

export const DeleteAccountError: React.FC<{ error: string }> = ({ error }) => {
	const { padding, margin, text } = useStyles()
	const colors = useThemeColor()

	return (
		<View style={[padding.medium, margin.top.large]}>
			<UnifiedText
				style={[text.align.center, text.bold, { color: colors['secondary-background-header'] }]}
			>
				{error}
			</UnifiedText>
		</View>
	)
}
