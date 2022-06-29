import React from 'react'
import { StyleSheet, View } from 'react-native'

import { useStyles } from '@berty/contexts/styles'

export const CardBodyPriv: React.FC<{}> = props => {
	const { padding } = useStyles()

	return (
		<View style={[padding.horizontal.large, padding.bottom.medium, styles.content]}>
			{props.children}
		</View>
	)
}

const styles = StyleSheet.create({
	content: {
		backgroundColor: 'white',
		elevation: 7,
		shadowOpacity: 0.1,
		shadowRadius: 40,
		shadowColor: 'black',
		shadowOffset: { width: 0, height: 10 },
		borderRadius: 20,
	},
})
