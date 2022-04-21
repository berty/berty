import React from 'react'
import {
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
	StyleSheet,
	ViewStyle,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Icon } from '@ui-kitten/components'

import { useStyles } from '@berty/contexts/styles'
import { useNavigation } from '@berty/navigation'
import { useThemeColor } from '@berty/store/hooks'
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
	const { width, border, height, opacity } = useStyles()
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
	const { margin, border, column, row, padding } = useStyles()
	const colors = useThemeColor()

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
						style={[
							border.shadow.medium,
							margin.medium,
							border.radius.scale(20),
							{ backgroundColor: colors['main-background'], shadowColor: colors.shadow },
						]}
					>
						{children}
					</View>
				</View>
				{icon && (
					<TouchableOpacity
						style={[
							padding.vertical.medium,
							border.shadow.medium,
							row.item.justify,
							column.justify,
							_styles.closeRequest,
							{
								position: 'absolute',
								bottom: '5%',
								backgroundColor: colors['main-background'],
								shadowColor: colors.shadow,
							},
						]}
						onPress={goBack}
					>
						<Icon
							style={[row.item.justify, _styles.closeRequestIcon]}
							name='close-outline'
							width={25}
							height={25}
							fill={colors['secondary-text']}
						/>
					</TouchableOpacity>
				)}
			</SafeAreaView>
		</View>
	)
}
