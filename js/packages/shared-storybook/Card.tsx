import React, { Fragment } from 'react'
import {
	TouchableHighlight,
	TouchableHighlightProps,
	TouchableWithoutFeedback,
	TouchableWithoutFeedbackProps,
	StyleSheet,
} from 'react-native'

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

export const Card: React.FunctionComponent<TouchableWithoutFeedbackProps> = (props) => (
	<TouchableWithoutFeedback
		{...props}
		style={[style.default, props.style]}
		onPress={props.onPress ? props.onPress : (): null => null}
	>
		<Fragment>{props.children}</Fragment>
	</TouchableWithoutFeedback>
)

export default Card
