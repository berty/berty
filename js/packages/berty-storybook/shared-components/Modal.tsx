import React, { useState } from 'react'
import { TouchableOpacity, View, StyleSheet } from 'react-native'
import { Text, Icon } from 'react-native-ui-kitten'
import { styles, colors, requestStyles } from '../styles'
import { UserProps } from '../shared-props/User'

//
// Modal => Modals on screens requests
//

// Types
type ModalProps = {
	children: React.ReactNode
	diffHeight?: number
}

// Styles
const _modalStyles = StyleSheet.create({
	closeRequest: {
		width: 45,
		height: 45,
		borderRadius: 22.5,
	},
	closeRequestIcon: {
		opacity: 0.5,
	},
})

export const Modal: React.FC<ModalProps> = ({ children, diffHeight = 60 }) => {
	const [layout, setLayout] = useState()

	return (
		<View
			style={[styles.absolute, styles.bottom, styles.left, styles.right, styles.bigMarginBottom]}
		>
			<View
				onLayout={(e) => !layout && setLayout(e.nativeEvent.layout.height)}
				style={[
					styles.bgWhite,
					styles.center,
					styles.shadow,
					styles.modalBorderRadius,
					requestStyles.bodyRequest,
					layout ? { height: layout - diffHeight } : null,
				]}
			>
				{children}
			</View>
			<TouchableOpacity
				style={[
					styles.bgWhite,
					styles.center,
					styles.spaceCenter,
					styles.centerItems,
					styles.shadow,
					styles.marginTop,
					_modalStyles.closeRequest,
				]}
			>
				<Icon
					style={[_modalStyles.closeRequestIcon]}
					name='close-outline'
					width={25}
					height={25}
					fill={colors.grey}
				/>
			</TouchableOpacity>
		</View>
	)
}
