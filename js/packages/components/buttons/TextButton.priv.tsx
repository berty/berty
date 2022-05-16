import React from 'react'
import { StyleSheet } from 'react-native'

import { UnifiedText } from '@berty/components/shared-components/UnifiedText'

const TextButtonPriv: React.FC<{ color: string }> = props => {
	return <UnifiedText style={[styles.text, { color: props.color }]}>{props.children}</UnifiedText>
}

const styles = StyleSheet.create({
	text: {
		textTransform: 'uppercase',
	},
})

export default TextButtonPriv
