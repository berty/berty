import React from 'react'
import {
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
	StyleSheet,
	SafeAreaView,
} from 'react-native'
import { Icon } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { useNavigation } from '@berty-tech/berty-navigation'
import { BlurView } from '@react-native-community/blur'

//
// Modal => Modals on screens requests
//

// Types
type ModalProps = {
	children: React.ReactNode
	icon?: boolean
}

// Styles
const useStylesModal = () => {
	const [{ width, border, height, opacity }] = useStyles()
	return {
		closeRequest: [width(45), height(45), border.radius.scale(22.5)],
		closeRequestIcon: opacity(0.5),
	}
}

export const Modal: React.FC<ModalProps> = ({ children, icon = true }) => {
	const { goBack } = useNavigation()
	const _styles = useStylesModal()
	const [{ absolute, margin, border, column, flex, background, row, color, padding }] = useStyles()
	return (
		<View style={[StyleSheet.absoluteFill]}>
			<TouchableWithoutFeedback onPress={goBack} style={[StyleSheet.absoluteFill]}>
				<BlurView style={[StyleSheet.absoluteFill]} blurType='light' blurAmount={50} />
			</TouchableWithoutFeedback>
			<SafeAreaView style={[absolute.bottom, absolute.left, absolute.right, margin.medium]}>
				<View
					style={[background.white, border.shadow.medium, margin.medium, border.radius.scale(20)]}
				>
					{children}
				</View>
				{icon && (
					<TouchableOpacity
						style={[
							flex.tiny,
							background.white,
							padding.vertical.medium,
							border.shadow.medium,
							row.item.justify,
							column.justify,
							_styles.closeRequest,
						]}
						onPress={goBack}
					>
						<Icon
							style={[row.item.justify, _styles.closeRequestIcon]}
							name='close-outline'
							width={25}
							height={25}
							fill={color.grey}
						/>
					</TouchableOpacity>
				)}
			</SafeAreaView>
		</View>
	)
}
