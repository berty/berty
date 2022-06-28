import { Icon } from '@ui-kitten/components'
import React from 'react'
import { StyleSheet, TouchableOpacity, TouchableOpacityProps, View } from 'react-native'

import { useThemeColor } from '@berty/hooks'

export const FloatingButtonPriv: React.FC<TouchableOpacityProps> = props => {
	const colors = useThemeColor()

	return (
		<View style={styles.container}>
			<TouchableOpacity
				style={[{ marginBottom: 20, shadowColor: colors.shadow }, styles.button, props.style]}
				onPress={props.onPress}
			>
				<Icon fill='white' name='plus' width={30} height={30} />
			</TouchableOpacity>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		right: 20,
		bottom: 20,
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
