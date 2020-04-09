import React from 'react'
import {
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
	StyleSheet,
	SafeAreaView,
	ViewStyle,
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
	blurColor?: ViewStyle['backgroundColor']
	blurColorOpacity?: number
	blurAmount?: number
}

// Styles
const useStylesModal = () => {
	const [{ width, border, height, opacity }] = useStyles()
	return {
		closeRequest: [width(45), height(45), border.radius.scale(22.5)],
		closeRequestIcon: opacity(0.5),
	}
}

export const Modal: React.FC<ModalProps> = ({
	children,
	icon = true,
	blurAmount = 50,
	blurColorOpacity = 0.15,
	blurColor,
}) => {
	const { goBack } = useNavigation()
	const _styles = useStylesModal()
	const [{ margin, border, column, background, row, color, padding }] = useStyles()
	return (
		<View style={[StyleSheet.absoluteFill]}>
			{blurColor && (
				<View
					style={[
						StyleSheet.absoluteFill,
						{ backgroundColor: blurColor, opacity: blurColorOpacity },
					]}
				/>
			)}
			<BlurView style={[StyleSheet.absoluteFill]} blurType='light' blurAmount={blurAmount} />
			<SafeAreaView style={{ height: '100%' }}>
				<View style={{ flexGrow: 1, justifyContent: 'center' }}>
					<TouchableWithoutFeedback onPress={goBack}>
						<View style={[StyleSheet.absoluteFill]} />
					</TouchableWithoutFeedback>
					<View
						style={[background.white, border.shadow.medium, margin.medium, border.radius.scale(20)]}
					>
						{children}
					</View>
				</View>
				{icon && (
					<TouchableOpacity
						style={[
							background.white,
							padding.vertical.medium,
							border.shadow.medium,
							row.item.justify,
							column.justify,
							_styles.closeRequest,
							{ position: 'absolute', bottom: '5%' },
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
