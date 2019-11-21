import React from 'react'
import { TouchableOpacity, View, StyleSheet, SafeAreaView } from 'react-native'
import { Icon } from 'react-native-ui-kitten'
import { styles, colors } from '../styles'

//
// Modal => Modals on screens requests
//

// Types
type ModalProps = {
	children: React.ReactNode
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

export const Modal: React.FC<ModalProps> = ({ children }) => (
	<SafeAreaView style={[styles.absolute, styles.left, styles.right, styles.bottom, styles.margin]}>
		<View style={[styles.bgWhite, styles.shadow, styles.margin, styles.modalBorderRadius]}>
			{children}
		</View>
		<TouchableOpacity
			style={[
				styles.bgWhite,
				styles.center,
				styles.spaceCenter,
				styles.centerItems,
				styles.shadow,
				styles.paddingVertical,
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
	</SafeAreaView>
)
