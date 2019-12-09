import React from 'react'
import {
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
	StyleSheet,
	SafeAreaView,
	ScrollView,
} from 'react-native'
import { Icon } from 'react-native-ui-kitten'
import { styles, colors } from '@berty-tech/styles'
import { useNavigation } from '@berty-tech/berty-navigation'
import { BlurView } from '@react-native-community/blur'

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

export const Modal: React.FC<ModalProps> = ({ children }) => {
	const { goBack } = useNavigation()
	return (
		<>
			<TouchableWithoutFeedback onPress={goBack} style={[StyleSheet.absoluteFill]}>
				<BlurView style={[StyleSheet.absoluteFill]} blurType='light' blurAmount={50} />
			</TouchableWithoutFeedback>
			<SafeAreaView
				style={[styles.absolute, styles.left, styles.right, styles.bottom, styles.margin]}
			>
				<View style={[styles.bgWhite, styles.shadow, styles.margin, styles.modalBorderRadius]}>
					{children}
				</View>
				<TouchableOpacity
					style={[
						styles.flex,
						styles.bgWhite,
						styles.center,
						styles.spaceCenter,
						styles.centerItems,
						styles.shadow,
						styles.paddingVertical,
						_modalStyles.closeRequest,
					]}
					onPress={goBack}
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
		</>
	)
}
