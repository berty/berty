import React from 'react'
import { StyleSheet } from 'react-native'

import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'

interface HeaderTitleProps {
	title: string
}

export const HeaderTitle = (props: HeaderTitleProps) => {
	const { text } = useStyles()

	return <UnifiedText style={[text.bold, styles.textWrapper]}>{props.title}</UnifiedText>
}

const styles = StyleSheet.create({
	textWrapper: {
		fontSize: 22,
		paddingLeft: 15,
		color: '#393C63',
	},
})
