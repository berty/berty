import React from 'react'
import { Modal, View, TouchableOpacity, StyleSheet, LayoutChangeEvent } from 'react-native'

import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'

interface BottomModalProps {
	children: React.ReactNode
	isVisible: boolean
	setIsVisible: (val: boolean) => void
}

export const BottomModal: React.FC<BottomModalProps> = ({ children, isVisible, setIsVisible }) => {
	const colors = useThemeColor()
	const { padding } = useStyles()
	const [childrenHeight, setChildrenHeight] = React.useState<number>(0)

	return (
		<Modal animationType='slide' transparent={true} visible={isVisible}>
			<View
				onLayout={({ nativeEvent: { layout } }: LayoutChangeEvent) => {
					setChildrenHeight(layout.height)
				}}
				style={[
					styles.container,
					{ backgroundColor: colors['main-background'] },
					padding.bottom.medium,
				]}
			>
				{children}
			</View>
			<View style={[StyleSheet.absoluteFill, styles.blur, { bottom: childrenHeight }]}>
				<TouchableOpacity
					activeOpacity={0}
					style={[StyleSheet.absoluteFill]}
					onPress={() => setIsVisible(false)}
				/>
			</View>
		</Modal>
	)
}

const styles = StyleSheet.create({
	container: {
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		position: 'absolute',
		bottom: 0,
		right: 0,
		left: 0,
	},
	blur: {
		elevation: 6,
		zIndex: 6,
	},
})
