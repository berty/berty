import React from 'react'
import { StyleSheet } from 'react-native'

import { UnifiedText } from '@berty/components/shared-components/UnifiedText'

const PrimaryTextPriv: React.FC = props => {
	return <UnifiedText style={styles.text}>{props.children}</UnifiedText>
}

const styles = StyleSheet.create({
	text: {
		color: 'white',
		textTransform: 'uppercase',
	},
})

export default PrimaryTextPriv
