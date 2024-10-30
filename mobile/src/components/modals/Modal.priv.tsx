import { BlurView } from '@react-native-community/blur'
import React from 'react'
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native'

import { useAppDimensions } from '@berty/contexts/app-dimensions.context'

interface ModalPrivProps {
	onClose: () => void
	backgroundColor?: string
}

export const ModalPriv: React.FC<ModalPrivProps> = props => {
	const { windowHeight } = useAppDimensions()

	return (
		<View style={[StyleSheet.absoluteFill, styles.container]}>
			<TouchableOpacity
				activeOpacity={0}
				style={[
					StyleSheet.absoluteFill,
					styles.button,
					{
						height: windowHeight,
						backgroundColor: props.backgroundColor,
					},
				]}
				onPress={props.onClose}
			>
				{Platform.OS === 'ios' && !props.backgroundColor && (
					<BlurView style={[StyleSheet.absoluteFill]} blurType='light' />
				)}
			</TouchableOpacity>
			{props.children}
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		elevation: 6,
		zIndex: 6,
	},
	button: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
	},
})
