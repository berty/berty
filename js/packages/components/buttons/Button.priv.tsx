import React, { useMemo } from 'react'
import { ActivityIndicator, StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native'

import { IButtonPress } from './interfaces'

interface IButtonProps extends IButtonPress {
	backgroundColor?: string
	borderColor?: string
}

const ButtonPriv: React.FC<IButtonProps> = props => {
	const style = useMemo((): StyleProp<ViewStyle> => {
		const styleArray: StyleProp<ViewStyle> = [styles.button]

		if (props.borderColor) {
			styleArray.push({ borderColor: props.borderColor, borderWidth: 1.5 })
		}
		if (props.backgroundColor) {
			styleArray.push({ backgroundColor: props.backgroundColor })
		}

		return styleArray
	}, [props.backgroundColor, props.borderColor])

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

export default ButtonPriv
