import React from 'react'
import { StyleSheet } from 'react-native'

import { UnifiedText } from '@berty/components/shared-components/UnifiedText'

const ErrorTextPriv: React.FC = props => {
	return <UnifiedText style={styles.text}>{props.children}</UnifiedText>
}

const styles = StyleSheet.create({
	text: {
		// TODO: replace with value from theme
		color: '#E35179',
		textTransform: 'uppercase',
	},
})

export default ErrorTextPriv
