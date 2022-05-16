import React, { useMemo } from 'react'
import { ActivityIndicator, StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native'

import { IButtonPress } from './interfaces'

interface IButtonProps extends IButtonPress {
	backgroundColor?: string
	borderColor?: string
}

const ButtonPriv: React.FC<IButtonProps> = props => {
	const borderStyle = useMemo((): StyleProp<ViewStyle> | undefined => {
		if (props.borderColor) {
			return { borderColor: props.borderColor, borderWidth: 1.5 }
		}
		return undefined
	}, [props.borderColor])

	const backgroundStyle = useMemo((): StyleProp<ViewStyle> => {
		if (props.backgroundColor) {
			return { backgroundColor: props.backgroundColor }
		}
		return { backgroundColor: 'transparent' }
	}, [props.backgroundColor])

	return (
		<TouchableOpacity
			style={[styles.button, backgroundStyle, borderStyle]}
			onPress={() => props.onPress()}
		>
			{props.loading ? (
				<ActivityIndicator color={props.backgroundColor ?? props.borderColor} />
			) : (
				props.children
			)}
		</TouchableOpacity>
	)
}

const styles = StyleSheet.create({
	button: {
		height: 44,
		borderRadius: 8,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
})

export default ButtonPriv
