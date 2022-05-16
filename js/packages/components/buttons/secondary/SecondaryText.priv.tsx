import React from 'react'
import { StyleSheet } from 'react-native'

import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useThemeColor } from '@berty/store'

const SecondaryTextPriv: React.FC = props => {
	const colors = useThemeColor()

	return (
		<UnifiedText style={[styles.text, { color: colors['background-header'] }]}>
			{props.children}
		</UnifiedText>
	)
}

const styles = StyleSheet.create({
	text: {
		textTransform: 'uppercase',
	},
})

export default SecondaryTextPriv
