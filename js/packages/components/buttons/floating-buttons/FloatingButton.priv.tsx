import { Icon } from '@ui-kitten/components'
import React, { useMemo } from 'react'
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native'

import { useAppDimensions } from '@berty/contexts/app-dimensions.context'
import { useThemeColor } from '@berty/store'

import { ButtonPressProps } from '../interfaces'

interface FloatingButtonPrivProps extends ButtonPressProps {
	backgroundColor?: string
}

export const FloatingButtonPriv: React.FC<FloatingButtonPrivProps> = props => {
	const { scaleSize } = useAppDimensions()
	const colors = useThemeColor()

	const style = useMemo((): StyleProp<ViewStyle> => {
		const styleArray: StyleProp<ViewStyle> = [
			styles.button,
			{ marginBottom: 20 * scaleSize, shadowColor: colors.shadow },
		]

		if (props.backgroundColor) {
			styleArray.push({ backgroundColor: props.backgroundColor })
		} else {
			styleArray.push({ backgroundColor: 'transparent' })
		}

		return styleArray
	}, [colors.shadow, props.backgroundColor, scaleSize])

	return (
		<View
			style={[
				styles.container,
				{
					right: 20 * scaleSize,
					bottom: 20 * scaleSize,
				},
			]}
		>
			<TouchableOpacity style={style} onPress={props.onPress}>
				<Icon fill='white' name='plus' width={30 * scaleSize} height={30 * scaleSize} />
			</TouchableOpacity>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
	},
	button: {
		width: 52,
		height: 52,
		borderRadius: 52,
		shadowOffset: {
			width: 0,
			height: 5,
		},
		shadowOpacity: 0.2,
		shadowRadius: 10,
		elevation: 5,
		alignItems: 'center',
		justifyContent: 'center',
	},
})
