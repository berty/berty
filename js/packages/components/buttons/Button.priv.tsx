import React, { useMemo } from 'react'
import { ActivityIndicator, StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native'

import { ButtonDefProps } from './interfaces'

interface ButtonPrivProps extends ButtonDefProps {
	backgroundColor?: string
	borderColor?: string
	borderRadius?: number
}

export const ButtonPriv: React.FC<ButtonPrivProps> = props => {
	const style = useMemo((): StyleProp<ViewStyle> => {
		const styleArray: StyleProp<ViewStyle> = [styles.button]

		if (props.borderColor) {
			styleArray.push({ borderColor: props.borderColor, borderWidth: 1.5 })
		}
		if (props.backgroundColor) {
			styleArray.push({ backgroundColor: props.backgroundColor })
		} else {
			styleArray.push({ backgroundColor: 'transparent' })
		}
		if (props.borderRadius) {
			styleArray.push({ borderRadius: props.borderRadius })
		}

		return styleArray
	}, [props.backgroundColor, props.borderColor, props.borderRadius])

	return (
		<TouchableOpacity style={style} onPress={props.onPress}>
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
