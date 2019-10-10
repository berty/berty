import React, { Fragment } from 'react'
import {
	View,
	ViewProps,
	TouchableHighlight,
	TouchableHighlightProps,
	StyleSheet,
} from 'react-native'
// import { Text } from 'react-native-ui-kitten'

const style = StyleSheet.create({
	default: {
		borderRadius: 20,
		padding: 32,
		margin: 16,
	},
})

export const TouchableCard: React.FunctionComponent<TouchableHighlightProps> = (props) => (
	<TouchableHighlight
		activeOpacity={0.9}
		underlayColor={'#000000'}
		{...props}
		style={[style.default, props.style]}
		onPress={props.onPress ? props.onPress : (): null => null}
	>
		<Fragment>{props.children}</Fragment>
	</TouchableHighlight>
)

export const Card: React.FunctionComponent<ViewProps> = (props) => (
	<View
		{...props}
		style={[style.default, props.style]}
		onPress={props.onPress ? props.onPress : (): null => null}
	>
		<Fragment>{props.children}</Fragment>
	</View>
)

export default Card
