import React, { Fragment } from 'react'
import { View, ViewProps, StyleSheet } from 'react-native'

const style = StyleSheet.create({
	default: {
		borderRadius: 20,
		padding: 16,
		margin: 16,
	},
})

export const Card: React.FunctionComponent<ViewProps> = props => (
	<View {...props} style={[style.default, props.style]}>
		<Fragment>{props.children}</Fragment>
	</View>
)
