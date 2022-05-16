import React from 'react'
import { StyleSheet } from 'react-native'

import { UnifiedText } from '@berty/components/shared-components/UnifiedText'

const TertiaryTextPriv: React.FC = props => {
	return <UnifiedText style={styles.text}>{props.children}</UnifiedText>
}

const styles = StyleSheet.create({
	text: {
		// TODO: replace with value from theme
		color: '#D2D3E1',
		textTransform: 'uppercase',
	},
})

export default TertiaryTextPriv
